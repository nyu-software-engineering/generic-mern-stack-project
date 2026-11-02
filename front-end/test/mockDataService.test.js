import assert from 'node:assert/strict'
import { test } from 'node:test'

const responseData = () => ({
  users: [{ id: 'owner-1' }, { id: 'student-2' }],
  listings: [{
    id: 1, ownerId: 'owner-1', title: 'Desk lamp', category: 'Study supplies',
    description: 'Adjustable lamp.', price: 5, rentalTerms: 'Return clean.',
    status: 'published',
  }],
  rentals: [{
    id: 101, listingId: 1, ownerId: 'owner-1', borrowerId: 'student-2',
    startDate: '2026-11-05', endDate: '2026-11-07', status: 'completed',
    totalPrice: 10, terms: { pricePerDay: 5, rentalTerms: 'Return clean.' },
    extensionRequest: null,
  }],
})

let moduleId = 0
const freshService = () => import(`../src/services/mockDataService.js?test=${moduleId++}`)

test('loads once for concurrent callers and keeps edits for the session', async (t) => {
  const payload = responseData()
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(payload))
  const service = await freshService()

  await Promise.all([service.loadMockData(), service.loadMockData()])
  service.updateListing(1, { title: 'Updated lamp' })
  await service.loadMockData()

  assert.equal(fetchMock.mock.callCount(), 1)
  assert.equal(fetchMock.mock.calls[0].arguments[0], '/mock-api/dormshare.json')
  assert.equal(service.getListings()[0].title, 'Updated lamp')
  assert.deepEqual(service.getRentals(), payload.rentals)
})

test('a failed request can retry without loading fallback fixtures', async (t) => {
  let attempts = 0
  t.mock.method(globalThis, 'fetch', async () => {
    attempts += 1
    return attempts === 1 ? new Response('', { status: 429 }) : Response.json(responseData())
  })
  const service = await freshService()

  await assert.rejects(service.loadMockData(), /429/)
  assert.deepEqual(service.getListings(), [])
  await service.loadMockData()
  assert.equal(service.getListings().length, 1)
})

for (const [name, corrupt] of [
  ['missing arrays', (data) => { delete data.users }],
  ['invalid price', (data) => { data.listings[0].price = '5' }],
  ['duplicate IDs', (data) => { data.listings.push({ ...data.listings[0] }) }],
  ['unknown borrower', (data) => { data.rentals[0].borrowerId = 'missing' }],
  ['unknown listing', (data) => { data.rentals[0].listingId = 99 }],
]) {
  test(`rejects ${name} before replacing loaded records`, async (t) => {
    const payload = responseData()
    corrupt(payload)
    t.mock.method(globalThis, 'fetch', async () => Response.json(payload))
    const service = await freshService()

    await assert.rejects(service.loadMockData(), /invalid/i)
    assert.deepEqual(service.getListings(), [])
    assert.deepEqual(service.getRentals(), [])
  })
}

test('listing actions use fetched records and getters return independent copies', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json(responseData()))
  const service = await freshService()
  await service.loadMockData()

  const listing = service.createListing({ title: 'New lamp', price: 3 })
  const another = service.createListing({ title: 'Another lamp', price: 4 })
  assert.notEqual(listing.id, another.id)
  assert.equal(listing.status, 'draft')
  service.updateListingStatus(listing.id, 'published')
  service.updateListingStatus(listing.id, 'paused')
  assert.equal(service.getListings().find((item) => item.id === listing.id).status, 'paused')
  assert.equal(service.updateListing(-1, { title: 'Missing' }), null)

  service.getListings()[0].title = 'Changed copy'
  service.getRentals()[0].terms.pricePerDay = 999
  assert.equal(service.getListings()[0].title, 'Another lamp')
  assert.equal(service.getRentals()[0].terms.pricePerDay, 5)
})
