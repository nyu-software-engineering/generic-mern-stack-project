import assert from 'node:assert/strict'
import { before, test } from 'node:test'
import { getConversation, sendOffer } from '../src/services/chat.js'
import { getItemRequest, getLatestResponse, respondToRequest } from '../src/services/itemRequests.js'
import { loadMockData } from '../src/services/mockDataService.js'
import { mockResponse } from './fixtures.js'

// Fixtures: request 2 ("HDMI cable") is from owner-1. student-2 owns the Projector
// and already has a chat with owner-1 about it that contains an old $18 offer.
before(async () => {
  globalThis.fetch = async () => Response.json(mockResponse())
  await loadMockData()
})

test('a message-only reply in an existing chat does not show the old offer', () => {
  const conversationId = respondToRequest(2, 'student-2', { listingId: 2, message: 'I have one.' })
  assert.equal(conversationId, 1, 'reuses the existing chat')

  const response = getLatestResponse(getItemRequest(2))
  assert.equal(response.responderId, 'student-2')
  assert.equal(response.offer, null)
})

test('a counteroffer from the requester is not credited to the responder', () => {
  respondToRequest(2, 'student-2', { listingId: 2, totalPrice: 12 })
  sendOffer(1, 'owner-1', { totalPrice: 10, startDate: '2099-01-01', endDate: '2099-01-03' })
  assert.equal(getConversation(1).messages.at(-1).totalPrice, 10)

  const response = getLatestResponse(getItemRequest(2))
  assert.equal(response.offer.senderId, 'student-2')
  assert.equal(response.offer.totalPrice, 12)
  assert.equal(getItemRequest(2).responses.length, 1, 'one response per chat')
})
