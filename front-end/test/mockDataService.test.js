import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mockResponse } from './fixtures.js'

let moduleId = 0

const freshService = () =>
  import(`../src/services/mockDataService.js?test=${moduleId++}`)

test('loads once and keeps local changes when another page loads', async (t) => {
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => Response.json(mockResponse())
  )

  const service = await freshService()

  assert.deepEqual(service.getListings(), [])
  assert.deepEqual(service.getReviews(), [])

  await Promise.all([
    service.loadMockData(),
    service.loadMockData(),
  ])

  service.updateListing('1', { title: 'Updated lamp' })

  service.createReview({
    bookingId: 106,
    reviewerId: 'owner-1',
    reviewedUserId: 'student-2',
    communicationRating: 5,
    itemCareRating: 5,
    overallRating: 5,
    comment: '',
    createdAt: '2026-11-03',
  })

  await service.loadMockData()

  assert.equal(fetchMock.mock.callCount(), 1)
  assert.equal(fetchMock.mock.calls[0].arguments[0], '/mock-api/dormshare.json')
  assert.equal(service.getListings()[0].title, 'Updated lamp')
  assert.equal(service.getReviews().length, 3)
  assert.equal(service.getUser('student-2').name, 'Online borrower')
})

test('retries after an HTTP error without loading fallback records', async (t) => {
  let attempts = 0

  t.mock.method(globalThis, 'fetch', async () => {
    attempts += 1
    return attempts === 1
      ? new Response('', { status: 429 })
      : Response.json(mockResponse())
  })

  const service = await freshService()

  await assert.rejects(service.loadMockData(), /429/)

  assert.deepEqual(service.getListings(), [])
  assert.deepEqual(service.getReviews(), [])

  await service.loadMockData()

  assert.equal(service.getListings().length, 2)
  assert.equal(service.getReviews().length, 2)
})

for (const [name, corrupt] of [
  ['missing arrays', (data) => { delete data.users }],
  ['missing reviews', (data) => { delete data.reviews }],
  ['invalid price', (data) => { data.listings[0].price = '5' }],
  ['duplicate IDs', (data) => { data.listings.push({ ...data.listings[0] }) }],
  ['missing user name', (data) => { delete data.users[0].name }],
  ['invalid rental count', (data) => { data.users[1].completedRentals = { count: 2 } }],
  ['invalid booking message', (data) => { data.rentals[0].terms.message = { text: 'Hello' } }],
  ['invalid rental terms', (data) => { data.rentals[0].terms.rentalTerms = { text: 'Return clean' } }],
  ['unknown borrower', (data) => { data.rentals[0].borrowerId = 'missing' }],
  ['unknown listing', (data) => { data.rentals[0].listingId = 99 }],
  ['invalid review rating', (data) => { data.reviews[0].overallRating = 6 }],
  ['review of incomplete booking', (data) => { data.reviews[0].bookingId = 101 }],
  ['review by nonparticipant', (data) => { data.reviews[0].reviewerId = 'outsider' }],
  ['duplicate reviews for a booking', (data) => { data.reviews.push({ ...data.reviews[0], id: 3 }) }],
  ['unknown item requester', (data) => { data.itemRequests[0].requesterId = 'missing' }],
  ['invalid item request status', (data) => { data.itemRequests[0].status = 'pending' }],
  ['response to a missing conversation', (data) => {
    data.itemRequests[0].responses = [{ responderId: 'owner-1', conversationId: 99 }]
  }],
]) {
  test(`rejects ${name} before storing records`, async (t) => {
    const payload = mockResponse()
    corrupt(payload)

    t.mock.method(
      globalThis,
      'fetch',
      async () => Response.json(payload)
    )

    const service = await freshService()

    await assert.rejects(service.loadMockData(), /invalid/i)

    assert.deepEqual(service.getListings(), [])
    assert.deepEqual(service.getRentals(), [])
    assert.deepEqual(service.getReviews(), [])
  })
}

test('owner filters and listing actions use the fetched records', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => Response.json(mockResponse())
  )

  const service = await freshService()
  await service.loadMockData()

  assert.equal(service.getListingsForOwner('owner-1').length, 1)
  assert.equal(service.getRentalsForOwner('owner-1').length, 7)

  const listing = service.createListing({
    title: 'Desk fan',
    price: 3,
  })

  assert.equal(listing.status, 'draft')

  service.updateListingStatus(listing.id, 'published')
  service.updateListingStatus(String(listing.id), 'paused')

  assert.equal(
    service.getListings().find((item) => item.id === listing.id).status,
    'paused'
  )

  service.getRentals()[0].terms.pricePerDay = 999

  assert.equal(service.getRental('101').terms.pricePerDay, 5)

  service.getReviews()[0].overallRating = 1

  assert.equal(service.getReviews()[0].overallRating, 5)
})