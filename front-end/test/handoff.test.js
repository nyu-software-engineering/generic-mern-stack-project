import assert from 'node:assert/strict'
import { after, before, mock, test } from 'node:test'
import * as mockDataService from '../src/services/mockDataService.js'
import {
  canConfirmPickup, canConfirmReturn, confirmPickup, confirmReturn, getBooking,
} from '../src/services/bookings.js'
import { mockResponse } from './fixtures.js'

// Fixture rentals (owner-1 lends to student-2): 101 requested, 103 confirmed, 104 active.
before(async () => {
  mock.method(globalThis, 'fetch', async () => Response.json(mockResponse()))
  await mockDataService.loadMockData()
})
after(() => mock.restoreAll())

const good = { condition: 'As described', accessoriesComplete: true, notes: '  Charger included  ' }

test('only the borrower can confirm pickup, and only on a confirmed booking', () => {
  assert.equal(canConfirmPickup(getBooking(103), 'student-2'), true)
  assert.equal(canConfirmPickup(getBooking(103), 'owner-1'), false)
  assert.equal(canConfirmPickup(getBooking(101), 'student-2'), false)
  assert.equal(canConfirmPickup(getBooking(104), 'student-2'), false)
})

test('only the owner can confirm return, and only on an active booking', () => {
  assert.equal(canConfirmReturn(getBooking(104), 'owner-1'), true)
  assert.equal(canConfirmReturn(getBooking(104), 'student-2'), false)
  assert.equal(canConfirmReturn(getBooking(103), 'owner-1'), false)
})

test('pickup is refused for the wrong person, status or condition', () => {
  assert.equal(confirmPickup(103, 'owner-1', good), null)
  assert.equal(confirmPickup(101, 'student-2', good), null)
  assert.equal(confirmPickup(103, 'student-2', { ...good, condition: 'Nope' }), null)
  assert.equal(getBooking(103).status, 'confirmed')
})

test('confirming pickup activates the booking and records the check', () => {
  const updated = confirmPickup(103, 'student-2', good)
  assert.equal(updated.status, 'active')
  assert.equal(updated.pickupCheck.condition, 'As described')
  assert.equal(updated.pickupCheck.accessoriesComplete, true)
  assert.equal(updated.pickupCheck.notes, 'Charger included')
  assert.equal(updated.pickupCheck.confirmedBy, 'student-2')
  assert.equal(canConfirmPickup(getBooking(103), 'student-2'), false)
})

test('return is refused for the borrower or an invalid condition', () => {
  assert.equal(confirmReturn(104, 'student-2', good), null)
  assert.equal(confirmReturn(104, 'owner-1', { ...good, condition: '' }), null)
  assert.equal(getBooking(104).status, 'active')
})

test('confirming return completes the booking and records the check', () => {
  const updated = confirmReturn(104, 'owner-1', { condition: 'Minor wear', accessoriesComplete: false })
  assert.equal(updated.status, 'completed')
  assert.equal(updated.returnCheck.condition, 'Minor wear')
  assert.equal(updated.returnCheck.accessoriesComplete, false)
  assert.equal(updated.returnCheck.confirmedBy, 'owner-1')
  assert.equal(confirmReturn(104, 'owner-1', good), null)
})
