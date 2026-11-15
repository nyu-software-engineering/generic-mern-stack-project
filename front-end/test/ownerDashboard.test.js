import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { createApp } from '../../back-end/app.js'
import { startTestServer } from '../../back-end/test/helpers/server.js'
import { getOwnerDashboard } from '../src/services/ownerDashboard.js'
import { ApiError } from '../src/services/api.js'
import { mockResponse } from './fixtures.js'

describe('Owner dashboard API integration (#112)', () => {
  const nativeFetch = globalThis.fetch
  const summary = { totalRentals: 7, activeRentals: 2, recordedIncome: 10 }
  let data
  let app
  let server

  before(async () => {
    app = createApp({ store: { load: async () => data } })
    server = await startTestServer(app)
    globalThis.fetch = (url, options) => nativeFetch(new URL(url, server.baseUrl), options)
  })

  beforeEach(() => {
    data = mockResponse()
    app.locals.mockDataStore.load = async () => data
  })

  after(async () => {
    globalThis.fetch = nativeFetch
    await server?.close()
  })

  it('returns server totals, owner-only rows and display names without changing shared data', async () => {
    const before = structuredClone(data)
    const result = await getOwnerDashboard()
    assert.deepEqual(result.summary, summary)
    assert.deepEqual(result.rentals.map((rental) => rental.id), [101, 102, 103, 104, 105, 106, 107])
    assert(result.rentals.every((rental) => rental.ownerId === 'owner-1'))
    assert.equal(result.rentals[0].listingTitle, 'Desk lamp')
    assert.equal(result.rentals[0].borrowerName, 'Online borrower')
    assert.deepEqual(data, before)
  })

  for (const [status, id] of [
    ['requested', 101], ['declined', 102], ['confirmed', 103], ['active', 104],
    ['extension_requested', 105], ['completed', 106], ['cancelled', 107],
  ]) {
    it(`requests ${status} rows while keeping the full summary`, async () => {
      const result = await getOwnerDashboard({ status })
      assert.deepEqual(result.rentals.map((rental) => rental.id), [id])
      assert.deepEqual(result.summary, summary)
    })
  }

  for (const search of ['  dEsK  ', 'Online borrower', 'student-2']) {
    it(`sends the search query ${JSON.stringify(search)} to the API`, async () => {
      const result = await getOwnerDashboard({ search })
      assert.equal(result.rentals.length, 7)
      assert.deepEqual(result.summary, summary)
    })
  }

  it('encodes query characters as search text rather than additional parameters', async () => {
    const search = 'Desk & status=active + ? # %'
    data.listings[0].title = search
    const result = await getOwnerDashboard({ search })
    assert.equal(result.rentals.length, 7)
    assert(result.rentals.every((rental) => rental.listingTitle === search))
  })

  it('combines search and status and preserves totals for an empty result', async () => {
    const matching = await getOwnerDashboard({ search: 'student-2', status: 'completed' })
    assert.deepEqual(matching.rentals.map((rental) => rental.id), [106])
    const empty = await getOwnerDashboard({ search: 'Projector', status: 'active' })
    assert.deepEqual(empty, { summary, rentals: [] })
  })

  it('reads later backend changes instead of reusing a client snapshot', async () => {
    await getOwnerDashboard()
    data.rentals[0].status = 'completed'
    data.listings[0].title = 'Updated lamp'
    data.users[1].name = 'Updated borrower'
    const result = await getOwnerDashboard()
    assert.equal(result.summary.recordedIncome, 20)
    assert.equal(result.rentals[0].listingTitle, 'Updated lamp')
    assert.equal(result.rentals[0].borrowerName, 'Updated borrower')
  })

  it('propagates invalid filter errors', async () => {
    await assert.rejects(getOwnerDashboard({ status: 'unknown' }), {
      name: 'ApiError', status: 400, message: 'Invalid dashboard filters.',
    })
  })

  it('propagates safe store failures through the shared API helper', async () => {
    app.locals.mockDataStore.load = async () => { throw Object.assign(new Error('private detail'), { status: 502 }) }
    await assert.rejects(getOwnerDashboard(), {
      name: 'ApiError', status: 502, message: 'Could not load mock data.',
    })
  })

  it('reports a network failure as an API error', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('offline') })
    await assert.rejects(getOwnerDashboard(), (error) => error instanceof ApiError && error.status === 0)
  })
})
