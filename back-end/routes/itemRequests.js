// Item request routes (#105). Requests live in the shared mock data store (#88).
// Responding opens or continues a chat with the requester, using the same message
// helpers as the conversation routes.
import { Router } from "express";
import { earliestToday, isDate } from "./bookings.js";
import { addOffer, addTextMessage, roundCents } from "../services/conversations.js";
import { getOpenItemRequests } from "../services/itemRequests.js";

export const itemRequestsRouter = Router();

const sameId = (a, b) => String(a) === String(b);
const text = (value) => (typeof value === "string" ? value.trim() : "");
const asObject = (body) => (body && typeof body === "object" && !Array.isArray(body) ? body : {});
const fail = (response, status, error) => response.status(status).json({ error });

// Text limits keep one long request from breaking the board layout.
const LIMITS = { itemName: 100, approximateArea: 100, details: 1000, message: 1000 };

// Only the requester sees every response. Other students see just their own, so
// they can't tell who else replied. Returns a copy; the stored request is unchanged.
const forViewer = (itemRequest, userId) =>
  sameId(itemRequest.requesterId, userId)
    ? itemRequest
    : { ...itemRequest, responses: itemRequest.responses.filter((item) => sameId(item.responderId, userId)) };

// Load the shared data before every item request route.
itemRequestsRouter.use(async (request, _response, next) => {
  request.data = await request.app.locals.mockDataStore.load();
  next();
});

// Load the request named in the URL, or answer 404.
itemRequestsRouter.param("id", (request, response, next, id) => {
  request.itemRequest = request.data.itemRequests.find((item) => sameId(item.id, id));
  if (!request.itemRequest) return fail(response, 404, "Item request not found.");
  next();
});

// Per-field messages match the create form, so the frontend can show each one by its field.
function itemRequestErrors({ itemName, neededBy, neededUntil, approximateArea, targetPrice = null, details = "" }) {
  const errors = {};
  if (!text(itemName)) errors.itemName = "Say what you need.";
  else if (text(itemName).length > LIMITS.itemName) errors.itemName = `Keep it under ${LIMITS.itemName} characters.`;
  if (!isDate(neededBy)) errors.neededBy = "Pick the date you need it from.";
  else if (neededBy < earliestToday()) errors.neededBy = "This date cannot be in the past.";
  if (!isDate(neededUntil)) errors.neededUntil = "Pick the date you need it until.";
  else if (!errors.neededBy && neededUntil <= neededBy) errors.neededUntil = "Must be after the start date.";
  if (!text(approximateArea)) errors.approximateArea = "Add an approximate area.";
  else if (text(approximateArea).length > LIMITS.approximateArea) {
    errors.approximateArea = `Keep it under ${LIMITS.approximateArea} characters.`;
  }
  if (targetPrice !== null &&
      !(Number.isFinite(targetPrice) && targetPrice >= 0 && Number.isFinite(roundCents(targetPrice)))) {
    errors.targetPrice = "Enter $0 or more, or leave it blank.";
  }
  if (typeof details !== "string") errors.details = "Details must be text.";
  else if (details.trim().length > LIMITS.details) errors.details = `Keep it under ${LIMITS.details} characters.`;
  return errors;
}

// Open requests for the board, newest first. Shares the board's definition of "open".
itemRequestsRouter.get("/", (request, response) => {
  response.json(getOpenItemRequests(request.data).map((item) => forViewer(item, request.currentUserId)));
});

itemRequestsRouter.get("/:id", (request, response) => {
  response.json(forViewer(request.itemRequest, request.currentUserId));
});

// The server sets the ID, requester, status, responses, and time.
itemRequestsRouter.post("/", (request, response) => {
  const body = asObject(request.body);
  const errors = itemRequestErrors(body);
  if (Object.keys(errors).length > 0) {
    return response.status(400).json({ error: "Invalid item request.", errors });
  }

  const { data } = request;
  const itemRequest = {
    id: Math.max(0, ...data.itemRequests.map((item) => item.id)) + 1,
    requesterId: request.currentUserId,
    itemName: body.itemName.trim(),
    neededBy: body.neededBy,
    neededUntil: body.neededUntil,
    approximateArea: body.approximateArea.trim(),
    targetPrice: body.targetPrice == null ? null : roundCents(body.targetPrice),
    details: (body.details ?? "").trim(),
    status: "open",
    responses: [],
    createdAt: new Date().toISOString(),
  };
  data.itemRequests.push(itemRequest);
  response.status(201).json(itemRequest);
});

// A response opens (or continues) a chat with the requester about one of the
// responder's published listings: a message, an offer for the requested dates, or both.
// The response keeps the IDs of the messages it sent, so the requester's summary
// ignores older messages in the same chat.
itemRequestsRouter.post("/:id/responses", (request, response) => {
  const { data, itemRequest, currentUserId } = request;
  if (sameId(itemRequest.requesterId, currentUserId)) {
    return fail(response, 403, "You cannot respond to your own request.");
  }
  if (itemRequest.status !== "open") return fail(response, 409, "This request is closed.");

  const { listingId, message = "", totalPrice } = asObject(request.body);
  if (typeof message !== "string") return fail(response, 400, "message must be text.");
  if (message.trim().length > LIMITS.message) {
    return fail(response, 400, `message must be ${LIMITS.message} characters or fewer.`);
  }
  if (totalPrice !== undefined && (!Number.isFinite(totalPrice) || totalPrice < 0)) {
    return fail(response, 400, "totalPrice must be a number of 0 or more.");
  }
  const total = totalPrice === undefined ? undefined : roundCents(totalPrice);
  if (total !== undefined && !Number.isFinite(total)) return fail(response, 400, "Offer total is too large.");
  if (!message.trim() && total === undefined) return fail(response, 400, "Send a message, an offer, or both.");
  if (!Number.isSafeInteger(listingId) || listingId < 1) {
    return fail(response, 400, "A positive integer listingId is required.");
  }

  const listing = data.listings.find((item) =>
    item.id === listingId && sameId(item.ownerId, currentUserId) && item.status === "published");
  if (!listing) return fail(response, 400, "Choose one of your published listings.");
  if (total !== undefined && itemRequest.neededBy < earliestToday()) {
    return fail(response, 409, "This request's dates have already passed.");
  }

  let conversation = data.conversations.find((item) =>
    item.listingId === listing.id &&
    item.participantIds.includes(currentUserId) && item.participantIds.includes(itemRequest.requesterId));
  if (!conversation) {
    conversation = {
      id: Math.max(0, ...data.conversations.map((item) => item.id)) + 1,
      listingId: listing.id,
      participantIds: [currentUserId, itemRequest.requesterId],
      messages: [],
    };
    data.conversations.push(conversation);
  }

  const messageIds = [];
  if (message.trim()) messageIds.push(addTextMessage(data, conversation, currentUserId, message.trim()).id);
  if (total !== undefined) {
    messageIds.push(addOffer(data, conversation, currentUserId, {
      totalPrice: total, startDate: itemRequest.neededBy, endDate: itemRequest.neededUntil,
    }).id);
  }

  const previous = itemRequest.responses.find((item) => item.conversationId === conversation.id);
  if (previous) previous.messageIds.push(...messageIds);
  else itemRequest.responses.push({ responderId: currentUserId, conversationId: conversation.id, messageIds });

  response.status(201).json({ request: forViewer(itemRequest, currentUserId), conversation });
});

itemRequestsRouter.patch("/:id/close", (request, response) => {
  const { itemRequest } = request;
  if (!sameId(itemRequest.requesterId, request.currentUserId)) {
    return fail(response, 403, "Only the requester can close this request.");
  }
  if (itemRequest.status === "closed") return fail(response, 409, "This request is already closed.");

  itemRequest.status = "closed";
  response.json(itemRequest);
});
