// Mock booking service. Pages call these functions instead of importing
// fixtures directly, so they can later be swapped for backend requests.
import {
  CURRENT_USER_ID,
  createRental,
  getListings,
  getRental,
  getRentals,
  getUser,
  updateRental,
  updateRentalStatus,
} from './mockDataService.js'

// TODO: replace with the signed-in user from Context once #49 lands.
export { CURRENT_USER_ID, getUser }

// Route params are strings and mock IDs are numbers, so compare as strings.
const sameId = (a, b) => String(a) === String(b)

export const getListing = (id) =>
  getListings().find((listing) => sameId(listing.id, id))
export const getBooking = (id) => getRental(id)

export const getIncomingRequests = (ownerId) =>
  getRentals().filter(
    (rental) => sameId(rental.ownerId, ownerId) && rental.status === 'requested',
  )

export const listingImage = (listingId, size = 160) =>
  `https://picsum.photos/seed/dormshare-${listingId}/${size}/${size}`

export function countDays(startDate, endDate) {
  return Math.round((new Date(endDate) - new Date(startDate)) / 86400000)
}

export function createBooking({ listingId, borrowerId, startDate, endDate, totalPrice, message }) {
  const listing = getListing(listingId)
  if (!listing) return null

  return createRental({
    listingId: listing.id,
    borrowerId,
    ownerId: listing.ownerId,
    startDate,
    endDate,
    status: 'requested',
    terms: { pricePerDay: listing.price, rentalTerms: listing.rentalTerms, message },
    totalPrice,
    createdAt: new Date().toISOString().slice(0, 10),
    extensionRequest: null,
  })
}

export function updateBookingStatus(id, status) {
  return updateRentalStatus(id, status)
}

// Price per day agreed for this booking, falling back to the listing price.
export function dailyRate(booking) {
  return booking.terms?.pricePerDay ?? getListing(booking.listingId)?.price ?? 0
}

// Extra cost of moving a booking's return date to newEndDate.
export function extensionCost(booking, newEndDate) {
  return Math.max(0, countDays(booking.endDate, newEndDate)) * dailyRate(booking)
}

// Borrower asks to return later (#55). Only active rentals can be extended.
export function requestExtension(id, newEndDate) {
  const booking = getBooking(id)
  if (!booking || booking.status !== 'active' || newEndDate <= booking.endDate) return null
  return updateRental(id, {
    status: 'extension_requested',
    extensionRequest: { newEndDate, status: 'pending' },
  })
}

// Owner answers an extension request (#55). Either way the rental goes back to active;
// if approved, the return date and total move to the new end date.
export function respondToExtension(id, approve) {
  const booking = getBooking(id)
  if (!booking || booking.status !== 'extension_requested' || !booking.extensionRequest) return null
  const { newEndDate } = booking.extensionRequest
  if (!approve) {
    return updateRental(id, {
      status: 'active',
      extensionRequest: { newEndDate, status: 'declined' },
    })
  }
  return updateRental(id, {
    status: 'active',
    endDate: newEndDate,
    totalPrice: booking.totalPrice + extensionCost(booking, newEndDate),
    extensionRequest: { newEndDate, status: 'approved' },
  })
}

export const getExtensionRequests = (ownerId) =>
  getRentals().filter(
    (rental) =>
      sameId(rental.ownerId, ownerId) &&
      rental.status === 'extension_requested' &&
      Boolean(rental.extensionRequest?.newEndDate),
  )

export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
