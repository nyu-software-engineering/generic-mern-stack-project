import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mockResponse } from './fixtures.js'
import {
  getRental,
  getReviews,
  loadMockData,
} from '../src/services/mockDataService.js'
import {
  getReputation,
  getReviewForBooking,
  getReviewTarget,
  getReviewableRentals,
  submitReview,
} from '../src/services/reviews.js'

test('reviews load from shared Mockaroo data and completed rentals support feedback', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => Response.json(mockResponse())
  )

  await loadMockData()

  // Reviews are seeded by the same shared payload as users and rentals.
  assert.equal(getReviews().length, 2)
  assert.equal(getReputation('owner-1').averageRating, 4.5)
  assert.equal(getReviewForBooking(106, 'student-2').overallRating, 5)
  assert.equal(getReviewForBooking(113, 'student-2').overallRating, 4)

  // Both booking orientations must work: owner-1 lends on #106, borrows on #113.
  assert.equal(getReviewTarget(getRental(106), 'owner-1'), 'student-2')
  assert.equal(getReviewTarget(getRental(113), 'owner-1'), 'student-2')

  assert.ok(
    getReviewableRentals('owner-1').some((item) => item.id === 106)
  )
  assert.ok(
    getReviewableRentals('owner-1').some((item) => item.id === 113)
  )
  assert.ok(
    !getReviewableRentals('student-2').some((item) => item.id === 106)
  )

  const validRatings = {
    communicationRating: 5,
    itemCareRating: 4,
    overallRating: 4,
  }

  assert.throws(
    () => submitReview({
      bookingId: 101,
      reviewerId: 'owner-1',
      ...validRatings,
    }),
    /completed/i
  )

  assert.throws(
    () => submitReview({
      bookingId: 106,
      reviewerId: 'owner-1',
      ...validRatings,
      itemCareRating: 0,
    }),
    /rating/i
  )

  const review = submitReview({
    bookingId: 113,
    reviewerId: 'owner-1',
    ...validRatings,
    comment: '',
  })

  assert.equal(review.reviewedUserId, 'student-2')
  assert.equal(review.comment, '')
  assert.equal(review.communicationRating, 5)
  assert.equal(review.itemCareRating, 4)
  assert.equal(review.overallRating, 4)

  // Newly submitted reviews use the same shared in-memory store.
  assert.equal(getReviews().length, 3)
  assert.equal(getReviewForBooking(113, 'owner-1').overallRating, 4)
  assert.equal(getReputation('student-2').averageRating, 4)

  assert.throws(
    () => submitReview({
      bookingId: 113,
      reviewerId: 'owner-1',
      ...validRatings,
    }),
    /already reviewed/i
  )
})