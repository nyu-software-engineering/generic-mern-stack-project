import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as mockDataService from '../src/services/mockDataService.js'
import { createBooking, getListing } from '../src/services/bookings.js'

test('new listings are visible to the booking service', () => {
  const listing = mockDataService.createListing({
    title: 'Shared fixture test item',
    category: 'Furniture',
    description: 'A test listing.',
    price: 6,
    rentalTerms: 'Return clean.',
  })

  assert.equal(getListing(listing.id)?.title, listing.title)
})

test('new bookings are visible to the owner dashboard service', () => {
  const booking = createBooking({
    listingId: 1,
    borrowerId: 'student-2',
    startDate: '2026-11-10',
    endDate: '2026-11-12',
    totalPrice: 30,
    message: 'For a class project.',
  })

  assert.ok(mockDataService.getRentals().some((rental) => rental.id === booking.id))
})

test('shared rentals include examples for every stored status', () => {
  const statuses = new Set(
    mockDataService.getRentalsForOwner('owner-1').map((rental) => rental.status),
  )

  for (const status of [
    'requested',
    'declined',
    'confirmed',
    'active',
    'extension_requested',
    'completed',
    'cancelled',
  ]) {
    assert.ok(statuses.has(status), `missing sample rental for ${status}`)
  }
})

test('owner data excludes records belonging to other owners', () => {
  assert.equal(typeof mockDataService.getListingsForOwner, 'function')
  assert.equal(typeof mockDataService.getRentalsForOwner, 'function')

  assert.ok(
    mockDataService.getListingsForOwner('owner-1').every((listing) => listing.ownerId === 'owner-1'),
  )
  assert.ok(
    mockDataService.getRentalsForOwner('owner-1').every((rental) => rental.ownerId === 'owner-1'),
  )
})
