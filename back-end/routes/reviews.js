
import { Router } from "express";

export const reviewsRouter = Router();

const sameId = (a, b) => String(a) === String(b);
const fail = (res, status, error) => res.status(status).json({ error });

const isParticipant = (rental, userId) =>
  sameId(rental.ownerId, userId) || sameId(rental.borrowerId, userId);

const findRental = (data, id) =>
  data.rentals.find((rental) => sameId(rental.id, id));

const validBookingId = (id) =>
  (Number.isSafeInteger(id) && id > 0) ||
  (typeof id === "string" && /^[1-9]\d*$/.test(id) &&
    Number.isSafeInteger(Number(id)));

// Public profiles must not expose private registered-account details.
function publicUser(user) {
  return {
    id: user.id,
    name: user.id.startsWith("account-") ? "DormShare student" : user.name,
    ...(user.completedRentals == null ? {} : { completedRentals: user.completedRentals }),
  };
}

// Public reputation and reviews received by a user.
reviewsRouter.get("/users/:id/reputation", async (request, response) => {
  const data = await request.app.locals.mockDataStore.load();
  const user = data.users.find((item) => sameId(item.id, request.params.id));

  if (!user) return fail(response, 404, "User not found.");

  const reviews = data.reviews
    .filter((review) => sameId(review.reviewedUserId, user.id))
    .sort((a, b) => b.id - a.id);

  const total = reviews.reduce((sum, review) => sum + review.overallRating, 0);

  response.json({
    user: publicUser(user),
    reviews,
    averageRating: reviews.length ? total / reviews.length : null,
  });
});

// The current user's submitted review for a booking, or null.
reviewsRouter.get("/bookings/:id/review", async (request, response) => {
  const data = await request.app.locals.mockDataStore.load();
  const rental = findRental(data, request.params.id);

  if (!rental) return fail(response, 404, "Booking not found.");
  if (!isParticipant(rental, request.currentUserId)) {
    return fail(response, 403, "You are not part of this booking.");
  }

  const review = data.reviews.find((item) =>
    sameId(item.bookingId, rental.id) &&
    sameId(item.reviewerId, request.currentUserId)
  );

  response.json(review ?? null);
});

// Submit one review per participant for a completed booking.
reviewsRouter.post("/reviews", async (request, response) => {
  const {
    bookingId, communicationRating, itemCareRating, overallRating, comment = "",
  } = request.body ?? {};

  if (!validBookingId(bookingId)) {
    return fail(response, 400, "A valid bookingId is required.");
  }

  const ratings = [communicationRating, itemCareRating, overallRating];
  if (ratings.some((rating) =>
    !Number.isInteger(rating) || rating < 1 || rating > 5
  )) {
    return fail(response, 400, "Select a rating from 1 to 5 for each category.");
  }

  if (typeof comment !== "string" || comment.trim().length > 500) {
    return fail(response, 400, "Written feedback must be 500 characters or less.");
  }

  const data = await request.app.locals.mockDataStore.load();
  const rental = findRental(data, bookingId);
  const reviewerId = request.currentUserId;

  if (!rental) return fail(response, 404, "Booking not found.");
  if (!isParticipant(rental, reviewerId)) {
    return fail(response, 403, "You are not part of this booking.");
  }
  if (rental.status !== "completed") {
    return fail(response, 409, "Only completed rentals can be reviewed.");
  }
  if (data.reviews.some((review) =>
    sameId(review.bookingId, rental.id) &&
    sameId(review.reviewerId, reviewerId)
  )) {
    return fail(response, 409, "You have already reviewed this participant.");
  }

  const reviewedUserId = sameId(rental.ownerId, reviewerId)
    ? rental.borrowerId
    : rental.ownerId;

  const review = {
    id: data.reviews.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    bookingId: rental.id,
    reviewerId,
    reviewedUserId,
    communicationRating,
    itemCareRating,
    overallRating,
    comment: comment.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
  };

  data.reviews.push(review);
  response.status(201).json(review);
});