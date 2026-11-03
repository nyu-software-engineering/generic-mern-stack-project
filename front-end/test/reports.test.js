import assert from 'node:assert/strict'
import { after, before, beforeEach, mock, test } from 'node:test'
import * as mockDataService from '../src/services/mockDataService.js'
import { createReport, getReport, resolveReportSubject } from '../src/services/reports.js'
import { mockResponse } from './fixtures.js'

before(async () => {
  mock.method(globalThis, 'fetch', async () => Response.json(mockResponse()))
  await mockDataService.loadMockData()
})
after(() => mock.restoreAll())

beforeEach(() => {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  }
})

const valid = { reason: 'Damage', description: 'Cracked base.' }

test('a report keeps a real rental and its listing', () => {
  const report = createReport({ ...valid, rentalId: '104' })
  assert.equal(report.rentalId, '104')
  assert.equal(report.listingId, '1')
  assert.equal(getReport(report.id).description, 'Cracked base.')
})

test('an unknown rental id is not saved on the report', () => {
  const report = createReport({ ...valid, rentalId: '999' })
  assert.equal(report.rentalId, '')
  assert.equal(report.listingId, '')
})

test('a real listing can be reported on its own', () => {
  const report = createReport({ ...valid, listingId: '1' })
  assert.equal(report.rentalId, '')
  assert.equal(report.listingId, '1')
})

test('a report with no subject is a general report', () => {
  const report = createReport(valid)
  assert.deepEqual(
    [report.rentalId, report.conversationId, report.listingId],
    ['', '', ''],
  )
  assert.deepEqual(resolveReportSubject({}), { booking: undefined, conversation: undefined, listing: undefined })
})

test('blank descriptions and unknown reasons are rejected', () => {
  assert.equal(createReport({ ...valid, description: '   ' }), null)
  assert.equal(createReport({ ...valid, reason: 'Nope' }), null)
})
