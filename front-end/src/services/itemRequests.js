// Item request service (#57). Pages call these functions instead of touching the
// shared store directly, so they can later be swapped for backend requests.
// Requests come from the shared Mockaroo data in mockDataService.js.
import {
  createItemRequest,
  getItemRequests as getAllItemRequests,
  getListingsForOwner,
  updateItemRequest,
} from './mockDataService.js'
import { todayISO } from './bookings.js'
import { getConversation, getConversations, sendMessage, sendOffer, startConversation } from './chat.js'

// Route params are strings and mock IDs are numbers, so compare as strings.
const sameId = (a, b) => String(a) === String(b)

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt)

export const getItemRequest = (id) => getAllItemRequests().find((r) => sameId(r.id, id))

// Open requests for the shared board, newest first.
export const getOpenItemRequests = () =>
  getAllItemRequests().filter((r) => r.status === 'open').sort(newestFirst)

// Published listings a student can offer in response to a request.
export const getOfferableListings = (userId) =>
  getListingsForOwner(userId).filter((listing) => listing.status === 'published')

export function validateItemRequest({ itemName, neededBy, neededUntil, approximateArea, targetPrice }) {
  const errors = {}
  if (!itemName.trim()) errors.itemName = 'Say what you need.'
  if (!neededBy) errors.neededBy = 'Pick the date you need it from.'
  else if (neededBy < todayISO()) errors.neededBy = 'This date cannot be in the past.'
  if (!neededUntil) errors.neededUntil = 'Pick the date you need it until.'
  else if (!errors.neededBy && neededUntil <= neededBy) errors.neededUntil = 'Must be after the start date.'
  if (!approximateArea.trim()) errors.approximateArea = 'Add an approximate area.'
  if (targetPrice !== '' && !(Number(targetPrice) >= 0)) errors.targetPrice = 'Enter $0 or more, or leave it blank.'
  return errors
}

// Returns { request } when saved, or { errors } when the form is invalid.
export function postItemRequest(form) {
  const errors = validateItemRequest(form)
  if (Object.keys(errors).length > 0) return { errors }

  const request = createItemRequest({
    itemName: form.itemName.trim(),
    neededBy: form.neededBy,
    neededUntil: form.neededUntil,
    approximateArea: form.approximateArea.trim(),
    targetPrice: form.targetPrice === '' ? null : Number(form.targetPrice),
    details: form.details.trim(),
  })
  return { request }
}

export const closeItemRequest = (id) => updateItemRequest(id, { status: 'closed' })

// A response opens (or continues) a chat with the requester about one of the
// responder's published listings. Pass totalPrice to include an offer for the
// requested dates. Returns the conversation ID, or null if the response is not allowed.
export function respondToRequest(requestId, responderId, { listingId, message = '', totalPrice }) {
  const request = getItemRequest(requestId)
  const listing = getOfferableListings(responderId).find((l) => sameId(l.id, listingId))
  const text = message.trim()
  const offer = totalPrice === undefined
    ? null
    : { totalPrice, startDate: request?.neededBy, endDate: request?.neededUntil }

  if (!request || request.status !== 'open' || sameId(request.requesterId, responderId) ||
    !listing || (!text && !offer)) return null

  const existing = getConversations(responderId).find((c) =>
    sameId(c.listingId, listing.id) && c.participantIds.includes(request.requesterId),
  )

  let conversationId
  const messageIds = []
  if (existing) {
    conversationId = existing.id
    if (text) messageIds.push(sendMessage(conversationId, responderId, text).messages.at(-1).id)
    if (offer) messageIds.push(sendOffer(conversationId, responderId, offer).messages.at(-1).id)
  } else {
    const messages = []
    if (text) messages.push({ senderId: responderId, type: 'text', text })
    if (offer) messages.push({ senderId: responderId, type: 'offer', ...offer, status: 'pending' })
    const conversation = startConversation({
      listingId: listing.id,
      participantIds: [responderId, request.requesterId],
      messages,
    })
    conversationId = conversation.id
    messageIds.push(...conversation.messages.map((m) => m.id))
  }

  // The response keeps the IDs of the messages it sent, so the requester's summary
  // ignores older messages in the same chat.
  const previous = request.responses.find((r) => sameId(r.conversationId, conversationId))
  updateItemRequest(request.id, {
    responses: previous
      ? request.responses.map((r) =>
        r === previous ? { ...r, messageIds: [...r.messageIds, ...messageIds] } : r)
      : [...request.responses, { responderId, conversationId, messageIds }],
  })
  return conversationId
}

// The newest response to a request: who sent it, and their latest offer for it
// (or null for a message-only reply). Counteroffers from the requester are not
// counted. Returns null when there are no responses.
export function getLatestResponse(request) {
  const response = request.responses.at(-1)
  const conversation = response && getConversation(response.conversationId)
  if (!conversation) return null

  const offer = conversation.messages.findLast((m) =>
    m.type === 'offer' && m.senderId === response.responderId && response.messageIds.includes(m.id))
  return { ...response, listingId: conversation.listingId, offer: offer ?? null }
}
