// Reports and community rules come from the back-end (#118): POST /api/reports,
// GET /api/reports/:id and GET /api/community-rules.
import { reportReasons } from '../data/options.js'
import { api } from './api.js'
import { getBooking, getListing } from './bookings.js'
import { getConversation } from './chat.js'

export const REPORT_REASONS = reportReasons

// Looks up what a report is about, for showing titles and names on the page.
// Unknown ids are dropped. The back-end still checks that the reporter is part of
// the rental or conversation.
export function resolveReportSubject({ rentalId, listingId, conversationId } = {}) {
  const booking = rentalId ? getBooking(rentalId) : undefined
  const conversation = conversationId ? getConversation(conversationId) : undefined
  const listing = getListing(booking?.listingId ?? conversation?.listingId ?? listingId)

  return { booking, conversation, listing }
}

// Rejects with an ApiError when the back-end refuses the report (for example 400).
export function createReport({ rentalId, listingId, conversationId, reason, description, imageName = '' }) {
  return api('/reports', {
    method: 'POST',
    body: { rentalId, listingId, conversationId, reason, description, imageName },
  })
}

// Rejects with an ApiError with status 404 if the report is unknown or not yours.
export const getReport = (id) => api(`/reports/${encodeURIComponent(id)}`)

export const getCommunityRules = () => api('/community-rules')
