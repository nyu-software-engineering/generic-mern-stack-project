import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getPublicListing, searchListings } from '../src/services/publicListings.js'

test('search sends both filters without treating special characters as query syntax', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json([{ id: 2 }]))
  assert.deepEqual(await searchListings({ search: 'Desk & lamp', category: 'Study supplies' }), [{ id: 2 }])
  const [path, options] = fetchMock.mock.calls[0].arguments
  const url = new URL(path, 'http://localhost')
  assert.equal(url.pathname, '/api/listings')
  assert.deepEqual(Object.fromEntries(url.searchParams), { search: 'Desk & lamp', category: 'Study supplies' })
  assert.equal(options.method, 'GET')
})

test('empty filters request all published listings', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json([]))
  assert.deepEqual(await searchListings(), [])
  assert.equal(fetchMock.mock.calls[0].arguments[0], '/api/listings')
})

test('item details use the public route and preserve API failures', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ id: 2 }))
  assert.deepEqual(await getPublicListing('2'), { id: 2 })
  assert.equal(fetchMock.mock.calls[0].arguments[0], '/api/listings/2')

  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Listing not found.' }, { status: 404 }))
  await assert.rejects(getPublicListing('3'), { name: 'ApiError', status: 404 })
})

test('reserved and malformed item IDs never request owner listings or the collection', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json([]))
  for (const id of ['mine', '..', '1e2', '0', '02']) {
    await assert.rejects(getPublicListing(id), { name: 'ApiError', status: 404 })
  }
  assert.equal(fetchMock.mock.callCount(), 0)
})
