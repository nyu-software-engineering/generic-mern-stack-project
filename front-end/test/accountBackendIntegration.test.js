
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../../back-end/app.js'
import { mockData } from '../../back-end/test/fixtures.js'
import { startTestServer } from '../../back-end/test/helpers/server.js'
import {
  createAuthSession,
  readPendingSignup,
} from '../src/context/authSession.js'
import { setSessionToken } from '../src/services/api.js'
import { createListing, getMyListings } from '../src/services/listings.js'
import { CURRENT_USER_ID } from '../src/services/mockDataService.js'
import { canCancel } from '../src/services/bookings.js'
import {
  cancelBookingRequest,
  fetchBooking,
  requestBooking,
} from '../src/services/bookingsApi.js'

test('real signup, verification and login scope listings to the account', async (t) => {
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

  function newSession() {
    return createAuthSession({
      onCurrentUser: (user) => {
        currentUser = user
      },
      onPendingSignup: () => {},
    })
  }

  const signupSession = newSession()

  const signup = await signupSession.signUp(
    'Integration Student',
    'integration@nyu.edu',
    'Password123!'
  )

  assert.equal(signup.user.emailVerified, false)
  assert.match(signup.demoCode, /^\d{6}$/)

  // Simulate reloading the application during verification.
  assert.deepEqual(readPendingSignup(), {
    email: 'integration@nyu.edu',
    demoCode: signup.demoCode,
  })

  const restoredSession = newSession()

  const verified = await restoredSession.verifyEmail(
    signup.demoCode
  )

  assert.equal(verified.emailVerified, true)
  assert.equal(readPendingSignup(), null)

  const signedIn = await restoredSession.signIn(
    'integration@nyu.edu',
    'Password123!'
  )

  assert.equal(signedIn.id, signup.user.id)
  assert.equal(currentUser.id, signup.user.id)
  assert.equal(CURRENT_USER_ID, signedIn.id)

  // The backend already has an owner-1 listing.
  // Our new account must not receive that owner's inventory.
  const existingOwnerListing = data.listings.find(
    (listing) => listing.ownerId === 'owner-1'
  )

  assert.ok(existingOwnerListing)
  assert.notEqual(existingOwnerListing.ownerId, CURRENT_USER_ID)

  const initialListings = await getMyListings()

  assert.deepEqual(initialListings, [])

  // This request goes through the actual Express route.
  // The session token must identify the new account.
  const created = await createListing({
    title: 'Desk fan',
    category: 'Appliances',
    description: 'Portable desk fan.',
    price: 4,
    rentalTerms: 'Return in good condition.',
  })

  assert.equal(created.ownerId, signedIn.id)
  assert.notEqual(created.ownerId, 'owner-1')
  assert.equal(created.status, 'draft')

  // Verify server-side ownership, not just the returned response.
  const saved = data.listings.find(
    (listing) => listing.id === created.id
  )

  assert.ok(saved)
  assert.equal(saved.ownerId, signedIn.id)

  const accountListings = await getMyListings()

  assert.deepEqual(accountListings, [created])
  assert.ok(accountListings.every(
    (listing) => listing.ownerId === signedIn.id
  ))

  // The pre-existing owner's listing remains untouched.
  assert.deepEqual(
    data.listings.find(
      (listing) => listing.id === existingOwnerListing.id
    ),
    existingOwnerListing
  )

  // The new account must be able to borrow owner-1's listing.
  const booking = await requestBooking({
    listingId: existingOwnerListing.id,
    startDate: '2030-03-01',
    endDate: '2030-03-03',
  })

  assert.equal(booking.borrowerId, signedIn.id)
  assert.equal(booking.ownerId, 'owner-1')

  // These role checks are used by the frontend booking screens.
  assert.equal(booking.ownerId === CURRENT_USER_ID, false)
  assert.equal(canCancel(booking, CURRENT_USER_ID), true)
  assert.deepEqual(await fetchBooking(booking.id), booking)

  // Withdrawal must work with the authenticated borrower's identity.
  const cancelled = await cancelBookingRequest(booking.id)

  assert.equal(cancelled.status, 'cancelled')
  assert.equal(
    data.rentals.find((rental) => rental.id === booking.id).status,
    'cancelled'
  )
  assert.equal(canCancel(cancelled, CURRENT_USER_ID), false)

  restoredSession.signOut()

  assert.equal(currentUser, null)
  assert.equal(CURRENT_USER_ID, 'owner-1')
})