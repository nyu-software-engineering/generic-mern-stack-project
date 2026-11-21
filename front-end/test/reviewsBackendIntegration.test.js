
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../../back-end/app.js'
import { mockData } from '../../back-end/test/fixtures.js'
import { startTestServer } from '../../back-end/test/helpers/server.js'
import { createAuthSession } from '../src/context/authSession.js'
import { setSessionToken } from '../src/services/api.js'
import {
  getReputation,
  getReviewForBooking,
  getReviewableRentals,
  submitReview,
} from '../src/services/reviews.js'

test('authenticated student reviews a completed rental through Express', async (t) => {
  const data = mockData()
  const app = createApp({
    store: { load: async () => data },
  })
  const server = await startTestServer(app)

  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.sessionStorage
  const stored = new Map()

  t.after(async () => {
    setSessionToken(null)
    globalThis.fetch = originalFetch

    if (originalStorage === undefined) {
      delete globalThis.sessionStorage
    } else {
      globalThis.sessionStorage = originalStorage
    }

    await server.close()
  })

  globalThis.sessionStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, String(value)),
    removeItem: (key) => stored.delete(key),
  }

  globalThis.fetch = (url, options) =>
    originalFetch(new URL(url, server.baseUrl), options)

  setSessionToken(null)

  let currentUser = null

  const session = createAuthSession({
    onCurrentUser: (user) => {
      currentUser = user
    },
    onPendingSignup: () => {},
  })

  const signup = await session.signUp(
    'Review Tester',
    'reviewtester@nyu.edu',
    'Password123!'
  )

  await session.verifyEmail(signup.demoCode)

  const user = await session.signIn(
    'reviewtester@nyu.edu',
    'Password123!'
  )

  assert.equal(user.id, signup.user.id)
  assert.equal(currentUser.id, user.id)

  // Add a completed booking involving this authenticated account.
  data.rentals.push({
    ...data.rentals[0],
    id: 202,
    borrowerId: user.id,
    status: 'completed',
  })

  const initial = await getReviewForBooking(202)
  assert.equal(initial, null)

  const reviewableBefore = await getReviewableRentals(user.id)
  assert.deepEqual(
    reviewableBefore.map((rental) => rental.id),
    [202]
  )

  const review = await submitReview({
    bookingId: 202,
    communicationRating: 5,
    itemCareRating: 4,
    overallRating: 4,
    comment: 'Smooth pickup and return.',
  })

  assert.equal(review.bookingId, 202)
  assert.equal(review.reviewerId, user.id)
  assert.equal(review.reviewedUserId, 'owner-1')
  assert.equal(review.comment, 'Smooth pickup and return.')

  assert.deepEqual(data.reviews.at(-1), review)

  const submitted = await getReviewForBooking(202)
  assert.deepEqual(submitted, review)

  const reputation = await getReputation('owner-1')
  assert.equal(reputation.reviews.length, 2)
  assert.equal(reputation.reviews[0].id, review.id)
  assert.equal(reputation.averageRating, 4.5)

  const reviewableAfter = await getReviewableRentals(user.id)
  assert.deepEqual(reviewableAfter, [])

  await assert.rejects(
    submitReview({
      bookingId: 202,
      communicationRating: 5,
      itemCareRating: 4,
      overallRating: 4,
      comment: '',
    }),
    {
      name: 'ApiError',
      status: 409,
    }
  )

  session.signOut()
  assert.equal(currentUser, null)
})