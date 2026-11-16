import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getMyRentals } from '../src/services/renterDashboard.js'
import { getSavedListings, saveListing, unsaveListing } from '../src/services/savedItems.js'

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

test('lets the page handle a rejected save or unsave', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ error: 'Listing not found.' }, { status: 404 }),
  )

  await assert.rejects(saveListing(9), { name: 'ApiError', status: 404 })
  await assert.rejects(unsaveListing(9), { name: 'ApiError', status: 404 })
})
