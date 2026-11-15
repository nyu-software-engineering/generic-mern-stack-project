import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getListings, loadMockData } from '../src/services/mockDataService.js'
import { mockResponse } from './fixtures.js'
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

test('Browse refreshes the cache for newly published and newly added listings', async (t) => {
  const seed = mockResponse()
  const paused = { ...seed.listings[1], status: 'paused' }
  seed.listings[1] = paused
  const published = { ...paused, status: 'published' }
  const added = { ...published, id: 3, title: 'USB charger' }
  t.mock.method(globalThis, 'fetch', async (path) =>
    Response.json(path === '/api/mock-data' ? seed : [published, added]),
  )

  await loadMockData()
  assert.equal(getListings().find(({ id }) => id === paused.id).status, 'paused')
  assert.equal(getListings().some(({ id }) => id === added.id), false)

  assert.deepEqual(await searchListings(), [published, added])
  assert.deepEqual(getListings().find(({ id }) => id === published.id), published)
  assert.deepEqual(getListings().find(({ id }) => id === added.id), added)
})

test('a superseded Browse response cannot overwrite newer cached listing data', async (t) => {
  const listing = { ...mockResponse().listings[1], id: 4 }
  const outdated = { ...listing, title: 'Outdated projector' }
  let finishOldSearch
  t.mock.method(globalThis, 'fetch', async (path) => {
    if (path.includes('search=old')) {
      return new Promise((resolve) => { finishOldSearch = resolve })
    }
    return Response.json([listing])
  })

  const oldRequest = new AbortController()
  const oldSearch = searchListings({ search: 'old', signal: oldRequest.signal })
  oldRequest.abort()
  await searchListings({ search: 'new' })
  finishOldSearch(Response.json([outdated]))
  await oldSearch

  assert.deepEqual(getListings().find(({ id }) => id === listing.id), listing)
})
