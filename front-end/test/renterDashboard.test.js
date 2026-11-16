import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getBooking } from '../src/services/bookings.js'
import { getRentals, loadMockData } from '../src/services/mockDataService.js'
import { getMyRentals } from '../src/services/renterDashboard.js'
import { getSavedListings, saveListing, unsaveListing } from '../src/services/savedItems.js'
import { mockResponse } from './fixtures.js'

test('loads renter rentals and saved listings from their API endpoints', async (t) => {
  const rental = { id: 101, listingTitle: 'Desk lamp' }
  const listing = { id: 2, title: 'Projector' }
  const fetchMock = t.mock.method(globalThis, 'fetch', async (path) =>
    Response.json(path === '/api/rentals/mine' ? [rental] : [listing]),
  )

  assert.deepEqual(await getMyRentals(), [rental])
  assert.deepEqual(await getSavedListings(), [listing])
  assert.deepEqual(fetchMock.mock.calls.map(({ arguments: [path, options] }) => [path, options.method]), [
    ['/api/rentals/mine', 'GET'],
    ['/api/saved-items', 'GET'],
  ])
})

test('saves and unsaves using the listing ID and accepts a 204 deletion', async (t) => {
  const listing = { id: 2, title: 'Projector' }
  const fetchMock = t.mock.method(globalThis, 'fetch', async (_path, { method }) =>
    method === 'POST' ? Response.json(listing, { status: 201 }) : new Response(null, { status: 204 }),
  )

  assert.deepEqual(await saveListing(2), listing)
  assert.equal(await unsaveListing(2), null)
  for (const [index, method] of ['POST', 'DELETE'].entries()) {
    const [path, options] = fetchMock.mock.calls[index].arguments
    assert.equal(path, '/api/saved-items')
    assert.equal(options.method, method)
    assert.deepEqual(JSON.parse(options.body), { listingId: 2 })
  }
})

test('makes new and updated dashboard rentals available to Booking Details', async (t) => {
  const initial = mockResponse()
  const existing = initial.rentals.find((rental) => rental.id === 201)
  const updated = { ...existing, status: 'active', listingTitle: 'Projector' }
  const created = { ...existing, id: 901, listingTitle: 'Projector' }
  const unrelated = initial.rentals[0]
  t.mock.method(globalThis, 'fetch', async (path) =>
    Response.json(path === '/api/mock-data' ? initial : [updated, created]),
  )

  await loadMockData()
  assert.equal(getBooking('901'), null)
  assert.equal(getBooking('201').status, 'confirmed')

  await getMyRentals()
  assert.deepEqual(getBooking('901'), created)
  assert.deepEqual(getBooking('201'), updated)
  assert.deepEqual(getBooking(unrelated.id), unrelated)
  assert.equal(getRentals().filter((rental) => rental.id === existing.id).length, 1)
})

test('lets the page handle a rejected save or unsave', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ error: 'Listing not found.' }, { status: 404 }),
  )

  await assert.rejects(saveListing(9), { name: 'ApiError', status: 404 })
  await assert.rejects(unsaveListing(9), { name: 'ApiError', status: 404 })
})
