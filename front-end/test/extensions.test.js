import assert from 'node:assert/strict'
import { after, before, mock, test } from 'node:test'
import * as mockDataService from '../src/services/mockDataService.js'
import {
  extensionCost, formatMoney, getBooking, getExtensionRequests, requestExtension, respondToExtension,
} from '../src/services/bookings.js'
import { mockResponse } from './fixtures.js'

// Fixture rentals (all owner-1, end date 2026-11-07, $5/day, total $10):
// 102 is declined, 104 is active, 105 is extension_requested with no request details.
before(async () => {
  mock.method(globalThis, 'fetch', async () => Response.json(mockResponse()))
  await mockDataService.loadMockData()
})
after(() => mock.restoreAll())

test('extension cost uses the agreed daily rate', () => {
  assert.equal(extensionCost(getBooking(104), '2026-11-10'), 15)
})

test('borrower can request an extension on an active rental', () => {
  const updated = requestExtension('104', '2026-11-10')
  assert.equal(updated.status, 'extension_requested')
  assert.deepEqual(updated.extensionRequest, { newEndDate: '2026-11-10', status: 'pending' })
  const pending = getExtensionRequests('owner-1').map((b) => b.id)
  assert.ok(pending.includes(104))
  assert.ok(!pending.includes(105), 'skips requests with no details')
})

test('extension requests are rejected for non-active rentals or earlier dates', () => {
  assert.equal(requestExtension('102', '2026-11-10'), null)
  const active = mockDataService.createRental({ ...getBooking(104), status: 'active', extensionRequest: null })
  assert.equal(requestExtension(active.id, '2026-11-06'), null)
})

test('approving moves the return date and adds the extra days to the total', () => {
  const updated = respondToExtension('104', true)
  assert.equal(updated.status, 'active')
  assert.equal(updated.endDate, '2026-11-10')
  assert.equal(updated.totalPrice, 25)
  assert.equal(updated.extensionRequest.status, 'approved')
})

test('declining returns the rental to active without changing dates or total', () => {
  requestExtension('104', '2026-11-12')
  const updated = respondToExtension('104', false)
  assert.equal(updated.status, 'active')
  assert.equal(updated.endDate, '2026-11-10')
  assert.equal(updated.totalPrice, 25)
  assert.equal(updated.extensionRequest.status, 'declined')
})

test('extension prices are rounded to cents and shown with two decimals', () => {
  const booking = { endDate: '2026-11-07', totalPrice: 38.42, terms: { pricePerDay: 1.1 } }
  assert.equal(extensionCost(booking, '2026-11-10'), 3.3) // raw 3 x 1.1 = 3.3000000000000003
  assert.equal(formatMoney(38.42 + 3.3), '$41.72')
  assert.equal(formatMoney(38.4), '$38.40')
})
