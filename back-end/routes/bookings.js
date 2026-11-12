// Booking routes (#91). Respond with mock JSON; nothing is saved to a database yet.
import { Router } from "express";
import * as data from "../data/bookingsMockData.js";

export const bookingsRouter = Router();

// TODO: use the current-user middleware from #88 once it lands.
// Until then the user is owner-1, or whoever the x-user-id header names (used by tests).
const currentUserId = (request) =>
  request.currentUserId ?? request.get("x-user-id") ?? "owner-1";

const sameId = (a, b) => String(a) === String(b);
const isDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
const countDays = (start, end) => Math.round((new Date(end) - new Date(start)) / 86400000);
const roundCents = (amount) => Math.round(amount * 100) / 100;

const findListing = (id) => data.listings.find((listing) => sameId(listing.id, id));
const findRental = (id) => data.rentals.find((rental) => sameId(rental.id, id));

const fail = (response, status, error) => response.status(status).json({ error });

// Load the booking named in the URL, or answer 404.
bookingsRouter.param("id", (request, response, next, id) => {
  request.rental = findRental(id);
  if (!request.rental) return fail(response, 404, "Booking not found.");
  next();
});

// Borrower requests a listing for a date range.
bookingsRouter.post("/", (request, response) => {
  const { listingId, startDate, endDate, message = "" } = request.body ?? {};
  const listing = findListing(listingId);
  const userId = currentUserId(request);

  if (!listing) return fail(response, 404, "Listing not found.");
  if (!isDate(startDate) || !isDate(endDate) || endDate <= startDate) {
    return fail(response, 400, "startDate and endDate must be YYYY-MM-DD, with endDate after startDate.");
  }
  if (sameId(listing.ownerId, userId)) return fail(response, 400, "You cannot book your own listing.");

  const rental = {
    id: Math.max(0, ...data.rentals.map((item) => item.id)) + 1,
    listingId: listing.id,
    ownerId: listing.ownerId,
    borrowerId: userId,
    startDate,
    endDate,
    status: "requested",
    terms: { pricePerDay: listing.price, rentalTerms: listing.rentalTerms, message: String(message) },
    totalPrice: roundCents(countDays(startDate, endDate) * listing.price),
    createdAt: new Date().toISOString().slice(0, 10),
    extensionRequest: null,
  };
  data.rentals.push(rental);
  response.status(201).json(rental);
});

// Requests waiting on the current user as owner.
// Declared before /:id so "requests" isn't read as a booking id.
bookingsRouter.get("/requests", (request, response) => {
  const userId = currentUserId(request);
  response.json(
    data.rentals.filter((rental) => sameId(rental.ownerId, userId) && rental.status === "requested"),
  );
});

bookingsRouter.get("/:id", (request, response) => {
  response.json(request.rental);
});

// Owner accepts or declines a request.
bookingsRouter.patch("/:id/status", (request, response) => {
  const { rental } = request;
  const { status } = request.body ?? {};

  if (!["confirmed", "declined"].includes(status)) {
    return fail(response, 400, 'status must be "confirmed" or "declined".');
  }
  if (!sameId(rental.ownerId, currentUserId(request))) {
    return fail(response, 403, "Only the owner can respond to this request.");
  }
  if (rental.status !== "requested") return fail(response, 409, `Booking is already ${rental.status}.`);

  rental.status = status;
  response.json(rental);
});
