import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { createApp } from '../../back-end/app.js'
import { startTestServer } from '../../back-end/test/helpers/server.js'
import { ApiError } from '../src/services/api.js'
import { getBooking, isLocalOnlyBooking } from '../src/services/bookings.js'
import { confirmPickupRequest, confirmReturnRequest, fetchBooking } from '../src/services/bookingsApi.js'
import { loadMockData } from '../src/services/mockDataService.js'
import { mockResponse } from './fixtures.js'

// Runs the handoff service against the real Express routes. The current user is
// owner-1: owner of 104 (active) and borrower on 201 (confirmed).
describe('Pickup and return API integration (#111)', () => {
  const nativeFetch = globalThis.fetch
  const checks = { condition: 'Minor wear', accessoriesComplete: true, notes: '  Small scratch.  ' }
  let data
  let app
  let server
  const stored = (id) => data.rentals.find((rental) => rental.id === id)

  before(async () => {
    app = createApp({ store: { load: async () => data } })
    server = await startTestServer(app)
    globalThis.fetch = (url, options) => nativeFetch(new URL(url, server.baseUrl), options)
  })

  beforeEach(async () => {
    data = mockResponse()
    app.locals.mockDataStore.load = async () => data
    await loadMockData()
  })

  after(async () => {
    globalThis.fetch = nativeFetch
    await server.close()
  })

  it('confirms pickup as the borrower and saves the check on the server', async () => {
    const booking = await confirmPickupRequest(201, checks)
    assert.equal(booking.status, 'active')
    assert.equal(booking.pickupCheck.condition, 'Minor wear')
    assert.equal(booking.pickupCheck.notes, 'Small scratch.')
    assert.equal(booking.pickupCheck.confirmedBy, 'owner-1')
    assert.equal(stored(201).status, 'active')
    assert.equal(getBooking(201).status, 'active')
    assert.equal(isLocalOnlyBooking(201), false)
    assert.equal((await fetchBooking(201)).pickupCheck.condition, 'Minor wear')
  })

  it('confirms the return as the owner and completes the booking', async () => {
    const booking = await confirmReturnRequest(104, { condition: 'As described' })
    assert.equal(booking.status, 'completed')
    assert.equal(booking.returnCheck.accessoriesComplete, false)
    assert.equal(stored(104).status, 'completed')
    assert.equal(getBooking(104).returnCheck.confirmedBy, 'owner-1')
  })

  it('reports who can confirm, which status is needed and what is invalid', async () => {
    await assert.rejects(confirmPickupRequest(103, checks), (error) => error.status === 403 && /borrower/.test(error.message))
    await assert.rejects(confirmReturnRequest(201, checks), (error) => error.status === 403 && /owner/.test(error.message))
    await assert.rejects(confirmReturnRequest(103, checks), (error) => error instanceof ApiError && error.status === 409)
    await assert.rejects(confirmPickupRequest(201, { condition: 'Nope' }), (error) => error.status === 400)
    await assert.rejects(confirmPickupRequest(999, checks), (error) => error.status === 404)
    assert.equal(stored(201).status, 'confirmed')
  })

  it('rejects confirming pickup twice', async () => {
    await confirmPickupRequest(201, checks)
    await assert.rejects(confirmPickupRequest(201, checks), (error) => error.status === 409)
  })
})
