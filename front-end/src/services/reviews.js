
import { api, ApiError } from './api.js'

const sameId = (a, b) => String(a) === String(b)

// Keep the participant-selection logic pure and independent of the API.
export function getReviewTarget(rental, reviewerId) {
  if (!rental || rental.status !== 'completed' || !reviewerId) {
    return null
  }

  if (sameId(rental.ownerId, reviewerId)) return rental.borrowerId
  if (sameId(rental.borrowerId, reviewerId)) return rental.ownerId

  return null
}

// Reputation and received reviews come directly from Express.
export function getReputation(userId) {
  return api(`/users/${encodeURIComponent(userId)}/reputation`)
}

// Return the current signed-in user's review, or null.
// The backend derives the reviewer from the session.
export function getReviewForBooking(bookingId) {
  return api(`/bookings/${encodeURIComponent(bookingId)}/review`)
}

// Collect completed rentals from both owner and borrower roles.
// Check the backend to exclude bookings already reviewed.
export async function getReviewableRentals(userId) {
  if (!userId) return []

  const [ownerDashboard, borrowedRentals] = await Promise.all([
    api('/owner/dashboard'),
    api('/rentals/mine'),
  ])

  const byId = new Map()

  for (const rental of [
    ...ownerDashboard.rentals,
    ...borrowedRentals,
  ]) {
    if (getReviewTarget(rental, userId)) {
      byId.set(String(rental.id), rental)
    }
  }

  const rentals = [...byId.values()].sort(
    (a, b) => Number(b.id) - Number(a.id)
  )

  const existingReviews = await Promise.all(
    rentals.map((rental) => getReviewForBooking(rental.id))
  )

  return rentals.filter((_, index) => !existingReviews[index])
}

// POST only editable review fields.
// Reviewer, reviewed user, ID, and date are server-controlled.
export function submitReview({
  bookingId,
  communicationRating,
  itemCareRating,
  overallRating,
  comment = '',
}) {
  const id = typeof bookingId === 'string' &&
    /^[1-9]\d*$/.test(bookingId)
    ? Number(bookingId)
    : bookingId

  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ApiError('A valid bookingId is required.', 400)
  }

  return api('/reviews', {
    method: 'POST',
    body: {
      bookingId: id,
      communicationRating,
      itemCareRating,
      overallRating,
      comment,
    },
  })
}