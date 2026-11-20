// Pickup and return routes (#113). Read and change rentals in the shared mock data store (#88);
// nothing is saved to a database yet.
//
// A rental looks like the one from /api/bookings. Pickup adds
//   pickupCheck: { condition, accessoriesComplete, notes, confirmedBy, confirmedAt }
// and return adds the same fields as returnCheck.
import { Router } from "express";

export const handoffRouter = Router();

const sameId = (a, b) => String(a) === String(b);
const fail = (response, status, error) => response.status(status).json({ error });

// Load the shared data before every handoff route.
handoffRouter.use(async (request, _response, next) => {
  request.data = await request.app.locals.mockDataStore.load();
  next();
});

// Load the rental named in the URL, or answer 404. Only its owner or borrower may use it.
handoffRouter.param("rentalId", (request, response, next, rentalId) => {
  request.rental = request.data.rentals.find((rental) => sameId(rental.id, rentalId));
  if (!request.rental) return fail(response, 404, "Booking not found.");

  const { ownerId, borrowerId } = request.rental;
  if (!sameId(ownerId, request.currentUserId) && !sameId(borrowerId, request.currentUserId)) {
    return fail(response, 403, "You are not part of this booking.");
  }
  next();
});

// The rental with its pickup and return checks, once they exist.
handoffRouter.get("/:rentalId", (request, response) => {
  response.json(request.rental);
});
