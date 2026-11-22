// Booking, extension, cancellation and handoff requests to the back-end (#93, #97, #100, #111).
// Every booking the API returns is also copied into the shared rental cache, so
// pages that still read it synchronously (chat, handoff, reporting) see the change.
// The route contracts are documented in back-end/README.md.
//
// Bookings that chat or pickup/return changed only in this browser (see
// isLocalOnlyBooking in bookings.js) don't exist on the server yet, or are older
// there. For those, these functions use the local copy and the original local
// logic instead, so nothing the user did is lost or overwritten.
import { ApiError, api } from './api.js'
import { cacheRentals } from './mockDataService.js'
import {
  CURRENT_USER_ID, cancelBooking, confirmPickup, confirmReturn, getBooking, isLocalOnlyBooking,
  requestExtension, respondToExtension, updateBookingStatus,
} from './bookings.js'

// Server bookings never replace a local-only booking in the cache. Local-only
// bookings use a separate ID range (see LOCAL_BOOKING_ID_START), so this is a
// safety net rather than something that should happen.
function cached(booking) {
  if (!isLocalOnlyBooking(booking.id)) cacheRentals([booking])
  return booking
}

// Lists never overwrite a local-only booking with the server's older copy.
function cachedList(bookings) {
  cacheRentals(bookings.filter((booking) => !isLocalOnlyBooking(booking.id)))
  return bookings
}

// Runs the local version of an action for a local-only booking.
// The local functions return null when the action isn't allowed.
function local(id, change, refusal) {
  const updated = change()
  if (!updated) throw new ApiError(refusal, getBooking(id) ? 409 : 404)
  return updated
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
  if (isLocalOnlyBooking(id)) {
    const booking = getBooking(id)
    if (booking) return booking
  }
  return cached(await api(`/bookings/${encodeURIComponent(id)}`))
}

// Requests waiting on the current user as owner.
export async function fetchBookingRequests() {
  return cachedList(await api('/bookings/requests'))
}

// status is 'confirmed' or 'declined'.
export async function answerBookingRequest(id, status) {
  if (isLocalOnlyBooking(id)) {
    return local(id, () => updateBookingStatus(id, status), 'This booking was already answered.')
  }
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
  if (isLocalOnlyBooking(id)) {
    return local(id, () => requestExtension(id, newEndDate),
      'Only active bookings can be extended, to a date after the current return date.')
  }
  return cached(await api(`/bookings/${encodeURIComponent(id)}/extensions`, {
    method: 'POST',
    body: { newEndDate },
  }))
}

export async function answerExtensionRequest(id, approve) {
  if (isLocalOnlyBooking(id)) {
    return local(id, () => respondToExtension(id, approve), 'There is no pending extension request.')
  }
  return cached(await api(`/bookings/${encodeURIComponent(id)}/extensions`, {
    method: 'PATCH',
    body: { approve },
  }))
}

// ---- Cancellation (#100) ----

export async function cancelBookingRequest(id) {
  if (isLocalOnlyBooking(id)) {
    return local(id, () => cancelBooking(id, CURRENT_USER_ID), 'This booking cannot be cancelled.')
  }
  return cached(await api(`/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST' }))
}

// ---- Pickup and return (#111) ----

// checks is { condition, accessoriesComplete, notes }. The server records who
// confirmed and when. The borrower confirms pickup; the owner confirms return.
export async function confirmPickupRequest(id, checks) {
  if (isLocalOnlyBooking(id)) {
    return local(id, () => confirmPickup(id, CURRENT_USER_ID, checks), 'This booking cannot be picked up.')
  }
  return cached(await api(`/handoff/${encodeURIComponent(id)}/pickup`, { method: 'POST', body: checks }))
}

export async function confirmReturnRequest(id, checks) {
  if (isLocalOnlyBooking(id)) {
    return local(id, () => confirmReturn(id, CURRENT_USER_ID, checks), 'This booking cannot be returned.')
  }
  return cached(await api(`/handoff/${encodeURIComponent(id)}/return`, { method: 'POST', body: checks }))
}
