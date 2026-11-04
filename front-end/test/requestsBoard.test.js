import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { getBoardRequests } from '../src/services/requestsBoard.js'

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

test('the board lists saved quick borrow requests newest first', () => {
  localStorage.setItem('dormshare.quickBorrowRequests', JSON.stringify([
    request('qb-1', '2026-11-01T09:00:00.000Z'),
    request('qb-2', '2026-11-02T09:00:00.000Z'),
  ]))
  const requests = getBoardRequests()
  assert.deepEqual(requests.map((item) => item.id), ['qb-2', 'qb-1'])
  assert.ok(requests.every((item) => item.type === 'quick'))
})

test('item requests stay empty until that service is added', () => {
  assert.deepEqual(getBoardRequests('item'), [])
})
