// Booking routes (#91). Read and change rentals in the shared mock data store (#88);
// nothing is saved to a database yet.
import { Router } from "express";

export const bookingsRouter = Router();

const sameId = (a, b) => String(a) === String(b);
// A real calendar date in YYYY-MM-DD form. Rejects 2026-13-01, 2026-02-30 and
// 2026-02-29 (not a leap year), which Date would otherwise roll over or reject.
export const isDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
// The earliest calendar date that is "today" anywhere (UTC-12). The booking form
// blocks start dates before the viewer's local today; the server can't see the
// viewer's time zone, so it accepts any date that is today somewhere and rejects
// dates that are already past everywhere.
export const earliestToday = (now = new Date()) =>
  new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString().slice(0, 10);
const countDays = (start, end) => Math.round((new Date(end) - new Date(start)) / 86400000);
const roundCents = (amount) => Math.round(amount * 100) / 100;

const fail = (response, status, error) => response.status(status).json({ error });

// Load the shared data before every booking route.
bookingsRouter.use(async (request, _response, next) => {
  request.data = await request.app.locals.mockDataStore.load();
  next();
});

// Load the booking named in the URL, or answer 404.
bookingsRouter.param("id", (request, response, next, id) => {
  request.rental = request.data.rentals.find((rental) => sameId(rental.id, id));
  if (!request.rental) return fail(response, 404, "Booking not found.");
  next();
});

// Borrower requests a published listing for a date range.
bookingsRouter.post("/", (request, response) => {
  const { data, currentUserId } = request;
  const { listingId, startDate, endDate, message = "" } = request.body ?? {};

  if (typeof message !== "string") return fail(response, 400, "message must be text.");

  if (!Number.isSafeInteger(listingId) || listingId < 1) {
    return fail(response, 400, "A positive integer listingId is required.");
  }
  const listing = data.listings.find((item) => item.id === listingId && item.status === "published");
  if (!listing) return fail(response, 404, "Listing not found.");
  if (!isDate(startDate) || !isDate(endDate) || endDate <= startDate) {
    return fail(response, 400, "startDate and endDate must be YYYY-MM-DD, with endDate after startDate.");
  }
  if (startDate < earliestToday()) return fail(response, 400, "startDate cannot be in the past.");
  if (sameId(listing.ownerId, currentUserId)) return fail(response, 400, "You cannot book your own listing.");

  // A huge listing price can overflow to Infinity, which would break the shared data.
  const totalPrice = roundCents(countDays(startDate, endDate) * listing.price);
  if (!Number.isFinite(totalPrice)) return fail(response, 400, "Booking total is too large.");

  const rental = {
    id: Math.max(0, ...data.rentals.map((item) => item.id)) + 1,
    listingId: listing.id,
    ownerId: listing.ownerId,
    borrowerId: currentUserId,
    startDate,
    endDate,
    status: "requested",
    terms: { pricePerDay: listing.price, rentalTerms: listing.rentalTerms, message },
    totalPrice,
    createdAt: new Date().toISOString().slice(0, 10),
    extensionRequest: null,
  };
  data.rentals.push(rental);
  response.status(201).json(rental);
});

// Requests waiting on the current user as owner.
// Declared before /:id so "requests" isn't read as a booking id.
bookingsRouter.get("/requests", (request, response) => {
  response.json(
    request.data.rentals.filter(
      (rental) => sameId(rental.ownerId, request.currentUserId) && rental.status === "requested",
    ),
  );
});

// Only the owner or borrower can see a booking.
bookingsRouter.get("/:id", (request, response) => {
  const { rental, currentUserId } = request;
  if (!sameId(rental.ownerId, currentUserId) && !sameId(rental.borrowerId, currentUserId)) {
    return fail(response, 403, "You are not part of this booking.");
  }
  response.json(rental);
});

// Owner accepts or declines a request.
bookingsRouter.patch("/:id/status", (request, response) => {
  const { rental } = request;
  const { status } = request.body ?? {};

  if (!["confirmed", "declined"].includes(status)) {
    return fail(response, 400, 'status must be "confirmed" or "declined".');
  }
  if (!sameId(rental.ownerId, request.currentUserId)) {
    return fail(response, 403, "Only the owner can respond to this request.");
  }
  if (rental.status !== "requested") return fail(response, 409, `Booking is already ${rental.status}.`);

  rental.status = status;
  response.json(rental);
});
