// Mock chat service. Pages call these functions instead of importing
// fixtures directly, so they can later be swapped for backend requests.
// Conversations come from the shared Mockaroo data in mockDataService.js.
import {
  getConversations as getAllConversations,
  updateConversation as saveConversation,
} from './mockDataService.js'
import { createBooking, getListing, getUser, updateBookingStatus } from './bookings.js'

// Route params are strings and mock IDs are numbers, so compare as strings.
const sameId = (a, b) => String(a) === String(b)

// Message IDs are unique across all conversations.
const nextMessageId = () =>
  Math.max(0, ...getAllConversations().flatMap((c) => c.messages.map((m) => m.id))) + 1

export const getConversation = (id) => getAllConversations().find((c) => sameId(c.id, id))

export const getLastMessage = (conversation) => conversation.messages.at(-1)

// Newest conversation first.
export const getConversations = (userId) =>
  getAllConversations()
    .filter((c) => c.participantIds.includes(userId))
    .sort((a, b) => new Date(getLastMessage(b).sentAt) - new Date(getLastMessage(a).sentAt))

export const getOtherParticipant = (conversation, userId) =>
  getUser(conversation.participantIds.find((id) => id !== userId))

export const getPendingOffer = (conversation) =>
  conversation.messages.findLast((m) => m.type === 'offer' && m.status === 'pending')

export const getLatestOffer = (conversation) =>
  conversation.messages.findLast((m) => m.type === 'offer')

function updateConversation(id, update) {
  const conversation = getConversation(id)
  if (!conversation) return undefined
  return saveConversation(id, update(conversation))
}

function setOfferStatus(conversationId, messageId, changes) {
  return updateConversation(conversationId, (c) => ({
    ...c,
    messages: c.messages.map((m) => (sameId(m.id, messageId) ? { ...m, ...changes } : m)),
  }))
}

function addMessage(conversationId, message) {
  const newMessage = { id: nextMessageId(), sentAt: new Date().toISOString(), ...message }
  return updateConversation(conversationId, (c) => ({ ...c, messages: [...c.messages, newMessage] }))
}

export function sendMessage(conversationId, senderId, text) {
  return addMessage(conversationId, { senderId, type: 'text', text })
}

// A new offer replaces any offer that is still waiting for an answer.
export function sendOffer(conversationId, senderId, { totalPrice, startDate, endDate }) {
  updateConversation(conversationId, (c) => ({
    ...c,
    messages: c.messages.map((m) =>
      m.type === 'offer' && m.status === 'pending' ? { ...m, status: 'countered' } : m,
    ),
  }))
  return addMessage(conversationId, {
    senderId,
    type: 'offer',
    totalPrice,
    startDate,
    endDate,
    status: 'pending',
  })
}

export function declineOffer(conversationId, messageId) {
  return setOfferStatus(conversationId, messageId, { status: 'declined' })
}

// Both students agreed in chat, so the offer becomes a confirmed booking
// whose terms and total come from the accepted offer.
export function acceptOffer(conversationId, messageId) {
  const conversation = getConversation(conversationId)
  const offer = conversation.messages.find((m) => sameId(m.id, messageId))
  const listing = getListing(conversation.listingId)
  const booking = createBooking({
    listingId: listing.id,
    borrowerId: conversation.participantIds.find((id) => id !== listing.ownerId),
    startDate: offer.startDate,
    endDate: offer.endDate,
    totalPrice: offer.totalPrice,
    message: 'Terms agreed in chat.',
  })
  updateBookingStatus(booking.id, 'confirmed')
  setOfferStatus(conversationId, messageId, { status: 'accepted', bookingId: booking.id })
  return booking
}

// "2:55 PM" for today, "Nov 1" for older messages.
export function formatSentAt(sentAt) {
  const date = new Date(sentAt)
  return date.toDateString() === new Date().toDateString()
    ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
