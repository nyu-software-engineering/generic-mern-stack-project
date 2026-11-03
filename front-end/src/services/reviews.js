import {
  CURRENT_USER_ID,
  createReview,
  getRental,
  getRentals,
  getReviews,
  getUser,
} from './mockDataService.js'

const sameId = (a, b) => String(a) === String(b)

export function getReviewTarget(rental, reviewerId) {
  if (!rental || rental.status !== 'completed') return null

  if (sameId(rental.ownerId, reviewerId)) return rental.borrowerId
  if (sameId(rental.borrowerId, reviewerId)) return rental.ownerId

  return null
}

export function getReviewsForUser(userId) {
  return getReviews()
    .filter((review) => sameId(review.reviewedUserId, userId))
    .sort((a, b) => b.id - a.id)
}

export function getReviewForBooking(bookingId, reviewerId) {
  return getReviews().find(
    (item) =>
      sameId(item.bookingId, bookingId) &&
      sameId(item.reviewerId, reviewerId)
  ) ?? null
}

export function getReputation(userId) {
  const user = getUser(userId)
  if (!user) return null

  const userReviews = getReviewsForUser(userId)
  const total = userReviews.reduce(
    (sum, review) => sum + review.overallRating,
    0
  )

  return {
    user,
    reviews: userReviews,
    averageRating: userReviews.length
      ? total / userReviews.length
      : null,
  }
}

export function getReviewableRentals(userId = CURRENT_USER_ID) {
  return getRentals()
    .filter(
      (rental) =>
        getReviewTarget(rental, userId) &&
        !getReviewForBooking(rental.id, userId)
    )
    .sort((a, b) => b.id - a.id)
}

export function submitReview({
  bookingId,
  reviewerId = CURRENT_USER_ID,
  communicationRating,
  itemCareRating,
  overallRating,
  comment = '',
}) {
  const rental = getRental(bookingId)
  const reviewedUserId = getReviewTarget(rental, reviewerId)

  if (!reviewedUserId) {
    throw new Error('Only completed rental participants can submit reviews.')
  }

  if (getReviewForBooking(bookingId, reviewerId)) {
    throw new Error('You have already reviewed this participant.')
  }

  const ratings = [
    communicationRating,
    itemCareRating,
    overallRating,
  ]

  if (ratings.some(
    (rating) => !Number.isInteger(rating) || rating < 1 || rating > 5
  )) {
    throw new Error('Select a rating from 1 to 5 for each category.')
  }

  if (typeof comment !== 'string' || comment.trim().length > 500) {
    throw new Error('Written feedback must be 500 characters or less.')
  }

  return createReview({
    bookingId: rental.id,
    reviewerId,
    reviewedUserId,
    communicationRating,
    itemCareRating,
    overallRating,
    comment: comment.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
  })
}