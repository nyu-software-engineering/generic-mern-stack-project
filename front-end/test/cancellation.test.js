import assert from 'node:assert/strict'
import { after, before, mock, test } from 'node:test'
import * as mockDataService from '../src/services/mockDataService.js'
import { cancelBooking, canCancel, displayStatus, getBooking, isOverdue } from '../src/services/bookings.js'
import { mockResponse } from './fixtures.js'

// Fixture rentals (owner-1 owns, student-2 borrows, end date 2026-11-07):
// 101 requested, 103 confirmed, 104 active, 105 extension_requested, 106 completed.
before(async () => {
  mock.method(globalThis, 'fetch', async () => Response.json(mockResponse()))
  await mockDataService.loadMockData()
})
after(() => mock.restoreAll())

test('overdue is derived for picked-up rentals past their return date', () => {
  assert.equal(isOverdue(getBooking(104), '2026-11-08'), true)
  assert.equal(isOverdue(getBooking(105), '2026-11-08'), true)
  assert.equal(isOverdue(getBooking(104), '2026-11-07'), false, 'due today is not overdue')
  assert.equal(isOverdue(getBooking(103), '2026-11-08'), false, 'not picked up yet')
  assert.equal(isOverdue(getBooking(106), '2026-11-08'), false, 'already returned')
  assert.equal(displayStatus(getBooking(104), '2026-11-08'), 'overdue')
  assert.equal(getBooking(104).status, 'active', 'overdue is never stored')
})

test('who can cancel depends on status and role', () => {
  assert.equal(canCancel(getBooking(101), 'student-2'), true, 'borrower withdraws a request')
  assert.equal(canCancel(getBooking(101), 'owner-1'), false, 'owner declines instead')
  assert.equal(canCancel(getBooking(103), 'owner-1'), true)
  assert.equal(canCancel(getBooking(103), 'student-2'), true)
  assert.equal(canCancel(getBooking(103), 'someone-else'), false)
  assert.equal(canCancel(getBooking(104), 'student-2'), false, 'cannot cancel after pickup')
})

test('cancelling is an end state', () => {
  assert.equal(cancelBooking('104', 'student-2'), null)
  assert.equal(cancelBooking('103', 'owner-1').status, 'cancelled')
  assert.equal(canCancel(getBooking(103), 'owner-1'), false)
  assert.equal(cancelBooking('103', 'owner-1'), null)
})
