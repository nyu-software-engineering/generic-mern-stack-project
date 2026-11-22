
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { setSessionToken } from '../src/services/api.js'
import {
  getReputation,
  getReviewForBooking,
  getReviewTarget,
  getReviewableRentals,
  submitReview,
} from '../src/services/reviews.js'

const ratings = {
  communicationRating: 5,
  itemCareRating: 4,
  overallRating: 5,
}

test('selects the opposite participant only for completed rentals', () => {
  const rental = {
    id: 101,
    ownerId: 'owner-1',
    borrowerId: 'student-2',
    status: 'completed',
  }

  assert.equal(getReviewTarget(rental, 'owner-1'), 'student-2')
  assert.equal(getReviewTarget(rental, 'student-2'), 'owner-1')
  assert.equal(getReviewTarget(rental, 'outsider'), null)
  assert.equal(getReviewTarget(null, 'owner-1'), null)

  assert.equal(
    getReviewTarget({ ...rental, status: 'active' }, 'owner-1'),
    null
  )
})

test('loads reputation from the backend', async (t) => {
  const reputation = {
    user: { id: 'owner-1', name: 'Item owner' },
    reviews: [{
      id: 1,
      reviewerId: 'student-2',
      overallRating: 5,
    }],
    averageRating: 5,
  }

  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => Response.json(reputation)
  )

  assert.deepEqual(
    await getReputation('owner-1'),
    reputation
  )

  assert.equal(
    fetchMock.mock.calls[0].arguments[0],
    '/api/users/owner-1/reputation'
  )
})

test('returns backend reviews and null for unreviewed bookings', async (t) => {
  const review = {
    id: 1,
    bookingId: 101,
    reviewerId: 'student-2',
    overallRating: 5,
  }

  let calls = 0

  t.mock.method(globalThis, 'fetch', async () => {
    calls += 1
    return Response.json(calls === 1 ? review : null)
  })

  assert.deepEqual(await getReviewForBooking(101), review)
  assert.equal(await getReviewForBooking(102), null)
})

test('combines owner and borrower rentals without duplicates', async (t) => {
  setSessionToken('account-session')
  t.after(() => setSessionToken(null))

  const userId = 'account-student'
  const requested = []

  const completedOwnerRental = {
    id: 101,
    ownerId: userId,
    borrowerId: 'student-2',
    status: 'completed',
  }

  const completedBorrowerRental = {
    id: 103,
    ownerId: 'owner-1',
    borrowerId: userId,
    status: 'completed',
  }

  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requested.push(url)

    assert.equal(
      options.headers.Authorization,
      'Bearer account-session'
    )

    if (url === '/api/owner/dashboard') {
      return Response.json({
        summary: {},
        rentals: [
          completedOwnerRental,
          { ...completedOwnerRental, id: 102, status: 'active' },
        ],
      })
    }

    if (url === '/api/rentals/mine') {
      return Response.json([
        completedBorrowerRental,
        completedOwnerRental,
        {
          id: 104,
          ownerId: 'student-3',
          borrowerId: 'student-4',
          status: 'completed',
        },
      ])
    }

    if (url === '/api/bookings/101/review') {
      return Response.json(null)
    }

    if (url === '/api/bookings/103/review') {
      return Response.json({ id: 8, bookingId: 103 })
    }

    throw new Error(`Unexpected request: ${url}`)
  })

  const result = await getReviewableRentals(userId)

  assert.deepEqual(result, [completedOwnerRental])
  assert.equal(
    requested.filter(
      (url) => url === '/api/bookings/101/review'
    ).length,
    1
  )
  assert.ok(!requested.includes('/api/bookings/102/review'))
  assert.ok(!requested.includes('/api/bookings/104/review'))
})

test('POST submits only editable review fields', async (t) => {
  setSessionToken('authenticated-session')
  t.after(() => setSessionToken(null))

  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => Response.json({
      id: 7,
      bookingId: 101,
      reviewerId: 'account-student',
      reviewedUserId: 'owner-1',
      ...ratings,
      comment: 'Great exchange.',
      createdAt: '2026-11-20',
    }, { status: 201 })
  )

  const saved = await submitReview({
    bookingId: '101',
    reviewerId: 'forged-user',
    reviewedUserId: 'forged-target',
    createdAt: '2000-01-01',
    ...ratings,
    comment: 'Great exchange.',
  })

  const [url, options] = fetchMock.mock.calls[0].arguments

  assert.equal(url, '/api/reviews')
  assert.equal(options.method, 'POST')
  assert.equal(
    options.headers.Authorization,
    'Bearer authenticated-session'
  )

  assert.deepEqual(JSON.parse(options.body), {
    bookingId: 101,
    ...ratings,
    comment: 'Great exchange.',
  })

  assert.equal(saved.reviewerId, 'account-student')
  assert.equal(saved.reviewedUserId, 'owner-1')
})

test('rejects malformed IDs before POST', () => {
  for (const bookingId of ['abc', '0', 0, -1, 1.5, null]) {
    assert.throws(
      () => submitReview({ bookingId, ...ratings }),
      { name: 'ApiError', status: 400 }
    )
  }
})

test('propagates backend duplicate-review and lookup errors', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url === '/api/reviews') {
      return Response.json({
        error: 'You have already reviewed this participant.',
      }, { status: 409 })
    }

    return Response.json({
      error: 'User not found.',
    }, { status: 404 })
  })

  await assert.rejects(
    submitReview({ bookingId: 101, ...ratings }),
    {
      name: 'ApiError',
      status: 409,
      message: 'You have already reviewed this participant.',
    }
  )

  await assert.rejects(
    getReputation('missing'),
    {
      name: 'ApiError',
      status: 404,
      message: 'User not found.',
    }
  )
})