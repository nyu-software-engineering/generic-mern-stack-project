// Mock booking service. Pages call these functions instead of importing
// fixtures directly, so they can later be swapped for backend requests.
import {
  CURRENT_USER_ID,
  createRental,
  getListings,
  getRental,
  getRentals,
  getUser,
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

export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
