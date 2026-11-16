import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { createApp } from '../../back-end/app.js'
import { startTestServer } from '../../back-end/test/helpers/server.js'
import * as listings from '../src/services/listings.js'
import * as cache from '../src/services/mockDataService.js'
import { getListing } from '../src/services/bookings.js'
import { ApiError } from '../src/services/api.js'
import { mockResponse } from './fixtures.js'

describe('Listing API integration (#108)', () => {
  const nativeFetch = globalThis.fetch
  let data
  let app
  let server
  const details = {
    title: 'Desk fan', category: 'Appliances', description: 'Small fan.',
    price: 3.5, rentalTerms: 'Return clean.',
  }

  before(async () => {
    data = mockResponse()
    app = createApp({ store: { load: async () => data } })
    server = await startTestServer(app)
    globalThis.fetch = (url, options) => nativeFetch(new URL(url, server.baseUrl), options)
    await cache.loadMockData()
  })

  beforeEach(() => {
    data = mockResponse()
    app.locals.mockDataStore.load = async () => data
  })

  after(async () => {
    globalThis.fetch = nativeFetch
    await server?.close()
  })

  it('loads owner listings from the API and preserves other owners in the cache', async () => {
    data.listings[0].title = 'Server lamp'
    const result = await listings.getMyListings()
    assert.deepEqual(result, [data.listings[0]])
    assert.equal(getListing(1).title, 'Server lamp')
    assert.equal(cache.getListings().find((listing) => listing.id === 2).ownerId, 'student-2')
  })

  it('creates a server-assigned draft visible to existing listing readers', async () => {
    const result = await listings.createListing(details)
    assert.equal(result.id, 3)
    assert.equal(result.ownerId, 'owner-1')
    assert.equal(result.status, 'draft')
    assert.deepEqual(data.listings[0], result)
    assert.deepEqual(getListing(result.id), result)
    assert.equal(listings.getPublishedListings().some((listing) => listing.id === result.id), false)
  })

  it('edits the backend listing and updates the shared client cache', async () => {
    const result = await listings.updateListing(1, details)
    assert.deepEqual(result, { ...data.listings[0], ...details })
    assert.equal(data.listings[0].title, 'Desk fan')
    assert.equal(result.ownerId, 'owner-1')
    assert.equal(result.status, 'published')
    assert.deepEqual(getListing('1'), result)
  })

  it('pauses and publishes through the API without duplicating cache records', async () => {
    const paused = await listings.updateListingStatus(1, 'paused')
    assert.equal(data.listings[0].status, 'paused')
    assert.deepEqual(getListing(1), paused)
    assert.equal(listings.getPublishedListings().some((listing) => listing.id === 1), false)
    const published = await listings.updateListingStatus(1, 'published')
    assert.equal(data.listings[0].status, 'published')
    assert.deepEqual(listings.getPublishedListings().find((listing) => listing.id === 1), published)
    assert.equal(cache.getListings().filter((listing) => listing.id === 1).length, 1)
  })

  it('removes owner listings that disappeared after a backend restart', async () => {
    const created = await listings.createListing(details)
    await listings.updateListingStatus(created.id, 'published')
    assert(listings.getPublishedListings().some((listing) => listing.id === created.id))
    const otherOwner = getListing(2)

    data = mockResponse()
    assert.deepEqual(await listings.getMyListings(), [data.listings[0]])
    assert.equal(getListing(created.id), undefined)
    assert.equal(listings.getPublishedListings().some((listing) => listing.id === created.id), false)
    assert.deepEqual(getListing(2), otherOwner)
  })

  it('clears only the current owner cache when the API returns no listings', async () => {
    await listings.getMyListings()
    const otherOwner = getListing(2)
    data.listings = data.listings.filter((listing) => listing.ownerId !== 'owner-1')

    assert.deepEqual(await listings.getMyListings(), [])
    assert.deepEqual(cache.getListingsForOwner('owner-1'), [])
    assert.deepEqual(getListing(2), otherOwner)
  })

  for (const [name, operation, status] of [
    ['invalid creation', () => listings.createListing({ ...details, title: '' }), 400],
    ['missing listing', () => listings.updateListing(999, details), 404],
    ["another owner's edit", () => listings.updateListing(2, details), 403],
    ['invalid status', () => listings.updateListingStatus(1, 'deleted'), 400],
    ["another owner's status", () => listings.updateListingStatus(2, 'paused'), 403],
  ]) {
    it(`preserves the cache and propagates API errors for ${name}`, async () => {
      const before = cache.getListings()
      await assert.rejects(operation(), (error) => error instanceof ApiError && error.status === status)
      assert.deepEqual(cache.getListings(), before)
    })
  }

  it('preserves cached records when the backend store is unavailable', async () => {
    const before = cache.getListings()
    app.locals.mockDataStore.load = async () => { throw Object.assign(new Error('private detail'), { status: 503 }) }
    for (const operation of [
      () => listings.getMyListings(),
      () => listings.createListing(details),
      () => listings.updateListing(1, details),
      () => listings.updateListingStatus(1, 'paused'),
    ]) {
      await assert.rejects(operation(), { name: 'ApiError', status: 503, message: 'Mock data is not configured.' })
    }
    assert.deepEqual(cache.getListings(), before)
  })

  it('does not change the cache when a network request fails', async (t) => {
    const before = cache.getListings()
    t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('offline') })
    await assert.rejects(listings.createListing(details), { name: 'ApiError', status: 0 })
    assert.deepEqual(cache.getListings(), before)
  })

  it('clones cache inputs and outputs and replaces string-equivalent IDs', () => {
    const record = { ...data.listings[0], id: 99, title: 'Cached item' }
    const result = cache.cacheListing(record)
    record.title = 'Changed input'
    result.title = 'Changed output'
    assert.equal(getListing(99).title, 'Cached item')
    cache.cacheListing({ ...record, id: '99', title: 'Updated item' })
    assert.equal(getListing(99).title, 'Updated item')
    assert.equal(cache.getListings().filter((listing) => String(listing.id) === '99').length, 1)
  })

  it('clones a full owner refresh and replaces reused IDs without removing unrelated items', () => {
    const unrelated = { ...data.listings[1], id: 42 }
    cache.cacheListing(unrelated)
    cache.cacheListing({ ...data.listings[1], id: '2' })
    const record = { ...data.listings[0], id: 2, title: 'Returned owner listing' }
    const result = cache.cacheOwnerListings([record])
    record.title = 'Changed input'
    result[0].title = 'Changed output'

    assert.equal(getListing(2).title, 'Returned owner listing')
    assert.equal(getListing(2).ownerId, 'owner-1')
    assert.equal(cache.getListings().filter((listing) => String(listing.id) === '2').length, 1)
    assert.deepEqual(getListing(42), unrelated)
  })
})
