import initialListings from '../data/listings.js'
import initialRentals from '../data/rentals.js'

export const CURRENT_USER_ID = 'owner-1'

let listings = structuredClone(initialListings)
let rentals = structuredClone(initialRentals)

const sameId = (first, second) => String(first) === String(second)

export function getListings() {
  return structuredClone(listings)
}

export function getListingsForOwner(ownerId) {
  return getListings().filter((listing) => sameId(listing.ownerId, ownerId))
}

export function getRentals() {
  return structuredClone(rentals)
}

export function getRentalsForOwner(ownerId) {
  return getRentals().filter((rental) => sameId(rental.ownerId, ownerId))
}

export function getRental(id) {
  const rental = rentals.find((item) => sameId(item.id, id))
  return rental ? structuredClone(rental) : null
}

export function createListing(details) {
  const id = Math.max(0, ...listings.map((item) => item.id)) + 1
  const listing = {
    id,
    ownerId: CURRENT_USER_ID,
    image: `https://picsum.photos/seed/dormshare-${id}/320/240`,
    ...details,
    status: 'draft',
  }

  listings = [listing, ...listings]
  return structuredClone(listing)
}

export function updateListing(id, details) {
  const existingListing = listings.find((item) => sameId(item.id, id))
  if (!existingListing) return null

  const updatedListing = { ...existingListing, ...details }
  listings = listings.map((item) =>
    sameId(item.id, id) ? updatedListing : item,
  )

  return structuredClone(updatedListing)
}

export function updateListingStatus(id, status) {
  return updateListing(id, { status })
}

export function createRental(details) {
  const id = Math.max(0, ...rentals.map((item) => item.id)) + 1
  const rental = { id, ...details }
  rentals = [...rentals, rental]
  return structuredClone(rental)
}

export function updateRental(id, details) {
  const existingRental = rentals.find((item) => sameId(item.id, id))
  if (!existingRental) return null

  const updatedRental = { ...existingRental, ...details }
  rentals = rentals.map((item) =>
    sameId(item.id, id) ? updatedRental : item,
  )

  return structuredClone(updatedRental)
}

export function updateRentalStatus(id, status) {
  return updateRental(id, { status })
}
