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

const ITEM_CONDITIONS = ["As described", "Minor wear", "Damaged"];

// Condition, accessories and notes recorded at a handoff, or an error message if the body is invalid.
// accessoriesComplete defaults to false and notes to an empty string.
function buildCheck(body, userId) {
  const { condition, accessoriesComplete = false, notes = "" } = body ?? {};
  if (!ITEM_CONDITIONS.includes(condition)) {
    return { error: `condition must be one of: ${ITEM_CONDITIONS.join(", ")}.` };
  }
  if (typeof accessoriesComplete !== "boolean") return { error: "accessoriesComplete must be true or false." };
  if (typeof notes !== "string") return { error: "notes must be text." };

  return {
    check: {
      condition,
      accessoriesComplete,
      notes: notes.trim(),
      confirmedBy: userId,
      confirmedAt: new Date().toISOString(),
    },
  };
}

// Borrower confirms pickup: confirmed -> active.
handoffRouter.post("/:rentalId/pickup", (request, response) => {
  const { rental, currentUserId } = request;
  const { check, error } = buildCheck(request.body, currentUserId);

  if (error) return fail(response, 400, error);
  if (!sameId(rental.borrowerId, currentUserId)) return fail(response, 403, "Only the borrower can confirm pickup.");
  if (rental.status !== "confirmed") return fail(response, 409, `A ${rental.status} booking cannot be picked up.`);

  rental.status = "active";
  rental.pickupCheck = check;
  response.json(rental);
});
