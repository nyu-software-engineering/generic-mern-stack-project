// Mock booking service. Pages call these functions instead of importing
// fixtures directly, so they can later be swapped for backend requests.
import users from '../data/users'
import listings from '../data/listings'
import rentals from '../data/rentals'

// TODO: replace with the signed-in user from Context once #49 lands.
export const CURRENT_USER_ID = 'owner-1'

// In-memory copy so changes persist while navigating (reset on reload).
let bookings = rentals.map((b) => ({ ...b }))
let nextId = Math.max(...rentals.map((b) => b.id)) + 1

// Route params are strings and mock IDs are numbers, so compare as strings.
const sameId = (a, b) => String(a) === String(b)

export const getUser = (id) => users.find((u) => sameId(u.id, id))
export const getListing = (id) => listings.find((l) => sameId(l.id, id))
export const getBooking = (id) => bookings.find((b) => sameId(b.id, id))

export const getIncomingRequests = (ownerId) =>
  bookings.filter((b) => sameId(b.ownerId, ownerId) && b.status === 'requested')

export const listingImage = (listingId, size = 160) =>
  `https://picsum.photos/seed/dormshare-${listingId}/${size}/${size}`

export function countDays(startDate, endDate) {
  return Math.round((new Date(endDate) - new Date(startDate)) / 86400000)
}

export function createBooking({ listingId, borrowerId, startDate, endDate, totalPrice, message }) {
  const listing = getListing(listingId)
  const booking = {
    id: nextId++,
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
  }
  bookings = [...bookings, booking]
  return booking
}

export function updateBookingStatus(id, status) {
  bookings = bookings.map((b) => (sameId(b.id, id) ? { ...b, status } : b))
  return getBooking(id)
}

export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
