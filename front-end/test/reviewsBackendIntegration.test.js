
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../../back-end/app.js'
import { mockData } from '../../back-end/test/fixtures.js'
import { startTestServer } from '../../back-end/test/helpers/server.js'
import { createAuthSession } from '../src/context/authSession.js'
import { setSessionToken } from '../src/services/api.js'
import { confirmReturnRequest } from '../src/services/bookingsApi.js'
import {
  canReviewCompletedHandoff,
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

  const completed = data.rentals.find((rental) => rental.id === 202)
  assert.equal(await canReviewCompletedHandoff(completed, user.id), true)
  assert.equal(await canReviewCompletedHandoff(completed, 'outsider'), false)

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
  assert.equal(await canReviewCompletedHandoff(completed, user.id), false)

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

  // Complete a real server handoff, then review as its owner.
  data.rentals.push({ ...data.rentals[0], id: 203, status: 'active' })
  const returned = await confirmReturnRequest(203, {
    condition: 'As described', accessoriesComplete: true, notes: '',
  })
  assert.equal(returned.status, 'completed')
  assert.equal(await canReviewCompletedHandoff(returned, 'owner-1'), true)
  await submitReview({
    bookingId: 203, communicationRating: 5, itemCareRating: 4,
    overallRating: 4, comment: '',
  })
  assert.equal(await canReviewCompletedHandoff(returned, 'owner-1'), false)
})