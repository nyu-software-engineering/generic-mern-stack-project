import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { loadMockData } from '../src/services/mockDataService.js'
import { getBoardRequests } from '../src/services/requestsBoard.js'
import { mockResponse } from './fixtures.js'

beforeEach(() => {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  }
})

const request = (id, createdAt) => ({
  id, requesterId: 'owner-1', itemName: 'Desk lamp', neededBy: '2026-12-01', neededTime: '10:00',
  borrowDuration: '1 day', approximateArea: 'Library', details: 'Need light.', status: 'open', createdAt,
})

test('your own quick borrow requests are listed under My requests, newest first', () => {
  localStorage.setItem('dormshare.quickBorrowRequests', JSON.stringify([
    request('qb-1', '2026-11-01T09:00:00.000Z'),
    request('qb-2', '2026-11-02T09:00:00.000Z'),
  ]))
  const mine = getBoardRequests('mine')
  assert.deepEqual(mine.map((item) => item.id), ['qb-2', 'qb-1'])
  assert.ok(mine.every((item) => item.type === 'quick'))
  assert.deepEqual(getBoardRequests('all'), [], 'own requests are kept out of the other tabs')
})

test('open item requests appear once the shared mock data loads', async (t) => {
  assert.deepEqual(getBoardRequests('item'), [])

  t.mock.method(globalThis, 'fetch', async () => Response.json(mockResponse()))
  await loadMockData()

  // Fixtures: "Rice cooker" is from student-2, "HDMI cable" is from owner-1 (you).
  const items = getBoardRequests('item')
  assert.deepEqual(items.map((item) => item.itemName), ['Rice cooker'])
  assert.ok(items.every((item) => item.type === 'item'))
  assert.deepEqual(getBoardRequests('mine').map((item) => item.itemName), ['HDMI cable'])
})
