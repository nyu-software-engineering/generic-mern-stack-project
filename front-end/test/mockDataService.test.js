import assert from 'node:assert/strict'
import { test } from 'node:test'

let moduleId = 0
const freshService = () => import(`../src/services/mockDataService.js?test=${moduleId++}`)

test('starts from shared listing and rental fixtures', async () => {
  const service = await freshService()
  const listings = service.getListings()
  const rentals = service.getRentals()

  assert.ok(listings.length > 0)
  assert.ok(rentals.length > 0)
  assert.deepEqual(
    new Set(rentals.map((rental) => rental.status)),
    new Set([
      'requested',
      'declined',
      'confirmed',
      'active',
      'extension_requested',
      'completed',
      'cancelled',
    ]),
  )
})

test('creates and updates listings in the shared service', async () => {
  const service = await freshService()
  const listing = service.createListing({
    title: 'Desk fan',
    category: 'Appliances',
    description: 'Small desk fan.',
    price: 3,
    rentalTerms: 'Return clean.',
  })

  assert.equal(listing.status, 'draft')
  assert.equal(service.updateListing(listing.id, { title: 'Desk fan, quiet' }).title, 'Desk fan, quiet')
  service.updateListingStatus(listing.id, 'published')
  service.updateListingStatus(listing.id, 'paused')
  assert.equal(service.getListings().find((item) => item.id === listing.id).status, 'paused')
})

test('returns only the requested owner’s records', async () => {
  const service = await freshService()

  assert.ok(service.getListingsForOwner('owner-1').every((listing) => listing.ownerId === 'owner-1'))
  assert.ok(service.getRentalsForOwner('owner-1').every((rental) => rental.ownerId === 'owner-1'))
  assert.ok(service.getListingsForOwner('owner-1').length < service.getListings().length)
  assert.ok(service.getRentalsForOwner('owner-1').length < service.getRentals().length)
})

test('updates a rental using a route string ID', async () => {
  const service = await freshService()
  const updated = service.updateRentalStatus('103', 'declined')

  assert.equal(updated.status, 'declined')
  assert.equal(service.getRental(103).status, 'declined')
})
