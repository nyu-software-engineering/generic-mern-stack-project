
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mockResponse } from './fixtures.js'
import {
  getRental,
  loadMockData,
} from '../src/services/mockDataService.js'
import {
  getReputation,
  getReviewForBooking,
  getReviewTarget,
  getReviewableRentals,
  submitReview,
} from '../src/services/reviews.js'

test('completed rentals support three ratings and optional feedback', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => Response.json(mockResponse())
  )

  await loadMockData()

  const rental = getRental(106)

  assert.equal(getReviewTarget(rental, 'owner-1'), 'student-2')
  assert.equal(getReviewTarget(rental, 'student-2'), 'owner-1')

  assert.ok(
    getReviewableRentals('owner-1').some((item) => item.id === 106)
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
    bookingId: 106,
    reviewerId: 'owner-1',
    ...validRatings,
    comment: '',
  })

  assert.equal(review.reviewedUserId, 'student-2')
  assert.equal(review.comment, '')
  assert.equal(review.communicationRating, 5)
  assert.equal(review.itemCareRating, 4)
  assert.equal(review.overallRating, 4)

  assert.equal(getReviewForBooking(106, 'owner-1').overallRating, 4)
  assert.equal(getReputation('student-2').averageRating, 4)

  assert.throws(
    () => submitReview({
      bookingId: 106,
      reviewerId: 'owner-1',
      ...validRatings,
    }),
    /already reviewed/i
  )
})
