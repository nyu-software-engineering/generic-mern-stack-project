import assert from 'node:assert/strict'
import { before, test } from 'node:test'
import { ApiError } from '../src/services/api.js'
import * as mockDataService from '../src/services/mockDataService.js'
import {
  REPORT_REASONS,
  createReport,
  getCommunityRules,
  getReport,
  resolveReportSubject,
} from '../src/services/reports.js'
import { mockResponse } from './fixtures.js'

before(async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(mockResponse()))
  await mockDataService.loadMockData()
  fetchMock.mock.restore()
})

const valid = { reason: 'Damage', description: 'Cracked base.' }

test('reasons come from the shared options', () => {
  assert.deepEqual(REPORT_REASONS, ['Damage', 'Missing item', 'Unsafe listing', 'Other'])
})

test('createReport posts the report to /api/reports and returns the saved report', async (t) => {
  const saved = { id: 'DS-101', ...valid, rentalId: '104' }
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(saved, { status: 201 }))

  const report = await createReport({ ...valid, rentalId: 104, imageName: 'crack.png' })

  assert.deepEqual(report, saved)
  const [path, options] = fetchMock.mock.calls[0].arguments
  assert.equal(path, '/api/reports')
  assert.equal(options.method, 'POST')
  assert.deepEqual(JSON.parse(options.body), { ...valid, rentalId: 104, imageName: 'crack.png' })
})

test('createReport sends no links for a general report', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ id: 'DS-102' }, { status: 201 }))

  await createReport(valid)

  assert.deepEqual(JSON.parse(fetchMock.mock.calls[0].arguments[1].body), { ...valid, imageName: '' })
})

test('createReport rejects with the back-end message and status when the report is refused', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ error: 'Invalid report details.' }, { status: 400 }),
  )

  await assert.rejects(createReport({ ...valid, rentalId: 999 }), (error) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.status, 400)
    assert.equal(error.message, 'Invalid report details.')
    return true
  })
})

test('getReport reads one report and rejects with 404 when it is not found', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async (path) =>
    path === '/api/reports/DS-101'
      ? Response.json({ id: 'DS-101' })
      : Response.json({ error: 'Report not found.' }, { status: 404 }),
  )

  assert.deepEqual(await getReport('DS-101'), { id: 'DS-101' })
  await assert.rejects(getReport('DS-999'), (error) => error.status === 404)
  assert.deepEqual(fetchMock.mock.calls.map(({ arguments: [path, options] }) => [path, options.method]), [
    ['/api/reports/DS-101', 'GET'],
    ['/api/reports/DS-999', 'GET'],
  ])
})

test('getReport encodes the id in the path', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({}))
  await getReport('a/b')
  assert.equal(fetchMock.mock.calls[0].arguments[0], '/api/reports/a%2Fb')
})

test('getCommunityRules loads the rules from /api/community-rules', async (t) => {
  const rules = [{ id: 'suitable-items', title: 'Suitable items', body: 'Tools.' }]
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(rules))

  assert.deepEqual(await getCommunityRules(), rules)
  assert.equal(fetchMock.mock.calls[0].arguments[0], '/api/community-rules')
})

test('a rental, conversation or listing is resolved for display', () => {
  const { booking, listing } = resolveReportSubject({ rentalId: '104' })
  assert.equal(String(booking.id), '104')
  assert.equal(String(listing.id), String(booking.listingId))
  assert.equal(resolveReportSubject({ listingId: '1' }).listing.id, 1)
})

test('unknown ids and a general report resolve to nothing', () => {
  for (const subject of [{ rentalId: '999' }, { conversationId: '999' }, {}]) {
    const { booking, conversation, listing } = resolveReportSubject(subject)
    assert.ok(!booking && !conversation && !listing)
  }
})
