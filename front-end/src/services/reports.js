// later to be replaced with real backend
// survives refresh
import { CURRENT_USER_ID } from './mockDataService.js'
import { getBooking, getListing } from './bookings.js'
import { getConversation } from './chat.js'

const STORAGE_KEY = 'dormshare.reports'

export const REPORT_REASONS = ['Damage', 'Missing item', 'Unsafe listing', 'Other']

function readAll() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// Looks up what a report is about. Unknown ids are dropped, so only real
// rentals, conversations and listings can be attached to a report.
export function resolveReportSubject({ rentalId, listingId, conversationId } = {}) {
  const booking = rentalId ? getBooking(rentalId) : undefined
  const conversation = conversationId ? getConversation(conversationId) : undefined
  const listing = getListing(booking?.listingId ?? conversation?.listingId ?? listingId)

  return { booking, conversation, listing }
}

export const getReport = (id) => readAll().find((report) => report.id === id)

// Returns the saved report, or null if the reason is invalid or the description is blank.
export function createReport({ rentalId, listingId, conversationId, reason, description, imageName = '', reporterId = CURRENT_USER_ID }) {
  const trimmed = description.trim()
  if (!REPORT_REASONS.includes(reason) || !trimmed) return null

  const { booking, conversation, listing } = resolveReportSubject({ rentalId, listingId, conversationId })
  const reports = readAll()
  const report = {
    id: `DS-${reports.length + 101}`,
    reporterId,
    rentalId: booking ? String(booking.id) : '',
    conversationId: conversation ? String(conversation.id) : '',
    listingId: listing ? String(listing.id) : '',
    reason,
    description: trimmed,
    imageName,
    status: 'awaiting moderator review',
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...reports, report]))
  return report
}
