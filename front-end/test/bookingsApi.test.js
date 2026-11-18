import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, describe, it } from 'node:test'
import { createApp } from '../../back-end/app.js'
import { startTestServer } from '../../back-end/test/helpers/server.js'
import { ApiError } from '../src/services/api.js'
import { clearLocalOnlyBooking, confirmPickup, getBooking, isLocalOnlyBooking } from '../src/services/bookings.js'
import { acceptOffer, getConversation, sendOffer } from '../src/services/chat.js'
import { loadMockData } from '../src/services/mockDataService.js'
import {
  answerBookingRequest, answerExtensionRequest, cancelBookingRequest, fetchBooking,
  fetchBookingRequests, fetchExtensionRequests, requestBooking, sendExtensionRequest,
} from '../src/services/bookingsApi.js'
import { mockResponse } from './fixtures.js'

// Runs the front-end service against the real Express routes. The current user is
// owner-1: owner of rentals 101-107 and borrower on 201 (confirmed) and 202 (active).
describe('Booking, extension and cancellation API integration (#93, #97, #100)', () => {
  const nativeFetch = globalThis.fetch
  let data
  let app
  let server
  const stored = (id) => data.rentals.find((rental) => rental.id === id)

  before(async () => {
    app = createApp({ store: { load: async () => data } })
    server = await startTestServer(app)
    globalThis.fetch = (url, options) => nativeFetch(new URL(url, server.baseUrl), options)
  })

  beforeEach(() => {
    data = mockResponse()
    const confirmedBorrowing = data.rentals.find((rental) => rental.id === 201)
    data.rentals.push({
      ...confirmedBorrowing, id: 202, status: 'active', startDate: '2030-01-01', endDate: '2030-01-03',
    })
    app.locals.mockDataStore.load = async () => data
  })

  after(async () => {
    globalThis.fetch = nativeFetch
    await server?.close()
  })

  describe('booking (#93)', () => {
    it('requests a booking that the server prices and saves', async () => {
      const booking = await requestBooking({
        listingId: '2', startDate: '2030-02-01', endDate: '2030-02-04', message: 'For a movie night',
      })
      assert.equal(booking.status, 'requested')
      assert.equal(booking.borrowerId, 'owner-1')
      assert.equal(booking.ownerId, 'student-2')
      assert.equal(booking.totalPrice, 27)
      assert.equal(booking.terms.message, 'For a movie night')
      assert.deepEqual(stored(booking.id), booking)
      assert.deepEqual(getBooking(booking.id), booking, 'cached for pages that read synchronously')
    })

    it('surfaces the server message when a request is rejected', async () => {
      await assert.rejects(
        requestBooking({ listingId: 2, startDate: '2020-01-01', endDate: '2020-01-02' }),
        (error) => error instanceof ApiError && error.status === 400 && /past/.test(error.message),
      )
      await assert.rejects(
        requestBooking({ listingId: 1, startDate: '2030-02-01', endDate: '2030-02-04' }),
        (error) => error.status === 400 && /own listing/.test(error.message),
      )
    })

    it('loads one booking and reports a missing one as 404', async () => {
      assert.equal((await fetchBooking('201')).status, 'confirmed')
      await assert.rejects(fetchBooking(999), (error) => error.status === 404)
    })

    it('lists only requests waiting on the current owner', async () => {
      assert.deepEqual((await fetchBookingRequests()).map((rental) => rental.id), [101])
    })

    it('confirms and declines requests, and rejects answering twice', async () => {
      const confirmed = await answerBookingRequest(101, 'confirmed')
      assert.equal(confirmed.status, 'confirmed')
      assert.equal(stored(101).status, 'confirmed')
      assert.equal(getBooking(101).status, 'confirmed')
      await assert.rejects(answerBookingRequest(101, 'declined'), (error) => error.status === 409)
    })

    it('does not let a borrower answer the request', async () => {
      const mine = await requestBooking({ listingId: 2, startDate: '2030-02-01', endDate: '2030-02-02' })
      await assert.rejects(answerBookingRequest(mine.id, 'confirmed'), (error) => error.status === 403)
    })
  })

  describe('extensions (#97)', () => {
    it('sends an extension request as the borrower', async () => {
      const booking = await sendExtensionRequest(202, '2030-01-06')
      assert.equal(booking.status, 'extension_requested')
      assert.deepEqual(booking.extensionRequest, { newEndDate: '2030-01-06', status: 'pending' })
      assert.equal(getBooking(202).status, 'extension_requested')
    })

    it('rejects an earlier return date with the server message', async () => {
      await assert.rejects(
        sendExtensionRequest(202, '2030-01-02'),
        (error) => error.status === 400 && /after the current return date/.test(error.message),
      )
    })

    it('lists and approves an extension as the owner, adding the extra days', async () => {
      const pending = stored(105)
      Object.assign(pending, { endDate: '2030-01-05', extensionRequest: { newEndDate: '2030-01-08', status: 'pending' } })

      assert.deepEqual((await fetchExtensionRequests()).map((rental) => rental.id), [105])
      const approved = await answerExtensionRequest(105, true)
      assert.equal(approved.status, 'active')
      assert.equal(approved.endDate, '2030-01-08')
      assert.equal(approved.totalPrice, 25)
      assert.equal(approved.extensionRequest.status, 'approved')
      assert.deepEqual(await fetchExtensionRequests(), [])
    })

    it('declines an extension without changing the dates or total', async () => {
      Object.assign(stored(105), { extensionRequest: { newEndDate: '2030-01-08', status: 'pending' } })
      const declined = await answerExtensionRequest(105, false)
      assert.equal(declined.endDate, '2026-11-07')
      assert.equal(declined.totalPrice, 10)
      assert.equal(declined.extensionRequest.status, 'declined')
    })
  })

  // Regressions from review: chat (#104) and pickup/return (#113) still save only in
  // the browser, so the booking pages must not lose or overwrite those changes.
  describe('bookings changed only in this browser', () => {
    const localIds = []

    beforeEach(async () => {
      await loadMockData()
    })

    afterEach(() => {
      for (const id of localIds.splice(0)) clearLocalOnlyBooking(id)
    })

    it('opens a booking created by accepting a chat offer, which the server does not have', async () => {
      const conversation = getConversation(data.conversations[0].id)
      const other = conversation.participantIds.find((id) => id !== 'owner-1')
      sendOffer(conversation.id, other, { totalPrice: 12, startDate: '2030-05-01', endDate: '2030-05-03' })
      const offer = getConversation(conversation.id).messages.findLast((message) => message.type === 'offer')

      const booking = acceptOffer(conversation.id, offer.id)
      localIds.push(booking.id)
      assert.equal(isLocalOnlyBooking(booking.id), true)
      assert.equal(stored(booking.id), undefined, 'the server has never seen this booking')

      const opened = await fetchBooking(booking.id)
      assert.equal(opened.id, booking.id)
      assert.equal(opened.status, 'confirmed')
      assert.equal(opened.totalPrice, 12)

      const cancelled = await cancelBookingRequest(booking.id)
      assert.equal(cancelled.status, 'cancelled')
      assert.equal(getBooking(booking.id).status, 'cancelled')
    })

    it('keeps a confirmed pickup when the booking summary reloads', async () => {
      await fetchBooking(201)
      const pickedUp = confirmPickup(201, 'owner-1', { condition: 'As described', accessoriesComplete: true })
      localIds.push(201)
      assert.equal(pickedUp.status, 'active')

      // "Back to booking summary" reloads the booking; the server still says confirmed.
      const reloaded = await fetchBooking(201)
      assert.equal(stored(201).status, 'confirmed')
      assert.equal(reloaded.status, 'active')
      assert.equal(reloaded.pickupCheck.condition, 'As described')

      await fetchBookingRequests()
      await fetchExtensionRequests()
      assert.equal(getBooking(201).status, 'active', 'list refreshes do not overwrite it either')

      const extended = await sendExtensionRequest(201, '2030-06-01')
      assert.equal(extended.status, 'extension_requested')
      assert.ok(getBooking(201).pickupCheck, 'the pickup check survives later changes')
    })

    it('explains why a local-only action is refused', async () => {
      const booking = acceptOffer(...(() => {
        const conversation = getConversation(data.conversations[0].id)
        const other = conversation.participantIds.find((id) => id !== 'owner-1')
        sendOffer(conversation.id, other, { totalPrice: 8, startDate: '2030-07-01', endDate: '2030-07-02' })
        const offer = getConversation(conversation.id).messages.findLast((message) => message.type === 'offer')
        return [conversation.id, offer.id]
      })())
      localIds.push(booking.id)
      await assert.rejects(
        sendExtensionRequest(booking.id, '2030-07-05'),
        (error) => error instanceof ApiError && error.status === 409 && /active/.test(error.message),
      )
    })
  })

  describe('cancellation (#100)', () => {
    it('cancels a confirmed booking and updates the cache', async () => {
      const cancelled = await cancelBookingRequest(201)
      assert.equal(cancelled.status, 'cancelled')
      assert.equal(stored(201).status, 'cancelled')
      assert.equal(getBooking(201).status, 'cancelled')
    })

    it('reports why a booking cannot be cancelled', async () => {
      await assert.rejects(
        cancelBookingRequest(101),
        (error) => error.status === 409 && /decline requests instead/.test(error.message),
      )
      await assert.rejects(cancelBookingRequest(104), (error) => error.status === 409)
    })
  })
})
