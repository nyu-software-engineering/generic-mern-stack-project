// Booking, extension and cancellation requests to the back-end (#93, #97, #100).
// Every booking the API returns is also copied into the shared rental cache, so
// pages that still read it synchronously (chat, handoff, reporting) see the change.
// The route contracts are documented in back-end/README.md.
import { api } from './api.js'
import { cacheRentals } from './mockDataService.js'

function cached(booking) {
  cacheRentals([booking])
  return booking
}

function cachedList(bookings) {
  cacheRentals(bookings)
  return bookings
}

// ---- Booking (#93) ----

// The server works out the owner, borrower, price terms and total.
export async function requestBooking({ listingId, startDate, endDate, message = '' }) {
  return cached(await api('/bookings', {
    method: 'POST',
    body: { listingId: Number(listingId), startDate, endDate, message },
  }))
}

export async function fetchBooking(id) {
  return cached(await api(`/bookings/${encodeURIComponent(id)}`))
}

// Requests waiting on the current user as owner.
export async function fetchBookingRequests() {
  return cachedList(await api('/bookings/requests'))
}

// status is 'confirmed' or 'declined'.
export async function answerBookingRequest(id, status) {
  return cached(await api(`/bookings/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  }))
}

// ---- Extensions (#97) ----

// Extension requests waiting on the current user as owner.
export async function fetchExtensionRequests() {
  return cachedList(await api('/bookings/extension-requests'))
}

export async function sendExtensionRequest(id, newEndDate) {
  return cached(await api(`/bookings/${encodeURIComponent(id)}/extensions`, {
    method: 'POST',
    body: { newEndDate },
  }))
}

export async function answerExtensionRequest(id, approve) {
  return cached(await api(`/bookings/${encodeURIComponent(id)}/extensions`, {
    method: 'PATCH',
    body: { approve },
  }))
}

// ---- Cancellation (#100) ----

export async function cancelBookingRequest(id) {
  return cached(await api(`/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST' }))
}
