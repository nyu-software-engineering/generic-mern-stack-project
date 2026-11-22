import { Router } from "express";
import { earliestToday, isDate } from "./bookings.js";
import { addOffer, addTextMessage, roundCents } from "../services/conversations.js";

export const conversationsRouter = Router();

const lastSentAt = (conversation) => Date.parse(conversation.messages.at(-1)?.sentAt) || 0;

conversationsRouter.param("id", async (request, response, next, id) => {
  const data = await request.app.locals.mockDataStore.load();
  const conversation = data.conversations.find((item) => String(item.id) === id);
  if (!conversation) return response.status(404).json({ error: "Conversation not found." });
  if (!conversation.participantIds.includes(request.currentUserId)) {
    return response.status(403).json({ error: "You can only open your own conversations." });
  }
  request.conversation = conversation;
  next();
});

// Inbox: the current user's conversations, newest message first.
conversationsRouter.get("/", async (request, response) => {
  const data = await request.app.locals.mockDataStore.load();
  response.json(data.conversations
    .filter((conversation) => conversation.participantIds.includes(request.currentUserId))
    .sort((a, b) => lastSentAt(b) - lastSentAt(a)));
});

conversationsRouter.get("/:id", (request, response) => {
  response.json(request.conversation);
});

// The server sets the ID, sender, and time. Other submitted fields are ignored.
conversationsRouter.post("/:id/messages", async (request, response) => {
  const text = request.body?.text;
  if (typeof text !== "string" || !text.trim()) {
    return response.status(400).json({ error: "Message text is required." });
  }

  const data = await request.app.locals.mockDataStore.load();
  const message = addTextMessage(data, request.conversation, request.currentUserId, text.trim());
  response.status(201).json(message);
});

conversationsRouter.post("/:id/offers", async (request, response) => {
  const { totalPrice, startDate, endDate } = request.body ?? {};
  if (!Number.isFinite(totalPrice) || totalPrice < 0) {
    return response.status(400).json({ error: "totalPrice must be a number of 0 or more." });
  }
  if (!isDate(startDate) || !isDate(endDate) || endDate <= startDate) {
    return response.status(400).json({
      error: "startDate and endDate must be YYYY-MM-DD, with endDate after startDate.",
    });
  }
  if (startDate < earliestToday()) {
    return response.status(400).json({ error: "startDate cannot be in the past." });
  }
  // A huge total can round to Infinity, which would make the shared data invalid.
  const total = roundCents(totalPrice);
  if (!Number.isFinite(total)) return response.status(400).json({ error: "Offer total is too large." });

  const data = await request.app.locals.mockDataStore.load();
  const offer = addOffer(data, request.conversation, request.currentUserId, { totalPrice: total, startDate, endDate });
  response.status(201).json(offer);
});

// Only the other participant can answer an offer, and only while it is pending.
// Sends the error response and returns null when the offer cannot be answered.
function answerableOffer(request, response) {
  const offer = request.conversation.messages.find((message) =>
    String(message.id) === request.params.messageId && message.type === "offer");
  if (!offer) {
    response.status(404).json({ error: "Offer not found." });
    return null;
  }
  if (offer.senderId === request.currentUserId) {
    response.status(403).json({ error: "You cannot answer your own offer." });
    return null;
  }
  if (offer.status !== "pending") {
    response.status(409).json({ error: `Offer is already ${offer.status}.` });
    return null;
  }
  return offer;
}

// Both students agreed in chat, so the offer becomes a confirmed booking. It uses
// the same fields as POST /api/bookings, with the total from the offer.
conversationsRouter.post("/:id/offers/:messageId/accept", async (request, response) => {
  const offer = answerableOffer(request, response);
  if (!offer) return;
  if (offer.startDate < earliestToday()) {
    return response.status(409).json({ error: "This offer's dates have already passed." });
  }

  const data = await request.app.locals.mockDataStore.load();
  const { conversation } = request;
  const listing = data.listings.find((item) =>
    item.id === conversation.listingId && item.status === "published");
  if (!listing) return response.status(409).json({ error: "This listing is no longer available." });

  const booking = {
    id: Math.max(0, ...data.rentals.map((item) => item.id)) + 1,
    listingId: listing.id,
    ownerId: listing.ownerId,
    borrowerId: conversation.participantIds.find((id) => id !== listing.ownerId),
    startDate: offer.startDate,
    endDate: offer.endDate,
    status: "confirmed",
    terms: { pricePerDay: listing.price, rentalTerms: listing.rentalTerms, message: "Terms agreed in chat." },
    totalPrice: offer.totalPrice,
    createdAt: new Date().toISOString().slice(0, 10),
    extensionRequest: null,
  };
  data.rentals.push(booking);
  offer.status = "accepted";
  offer.bookingId = booking.id;
  response.status(201).json({ offer, booking });
});

conversationsRouter.post("/:id/offers/:messageId/decline", (request, response) => {
  const offer = answerableOffer(request, response);
  if (!offer) return;
  offer.status = "declined";
  response.json(offer);
});
