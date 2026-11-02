import { listingCategories, listingStatuses, rentalStatuses } from '../data/options.js'

let listings = []
let rentals = []
let loading

function validateData(data) {
  const { users, listings, rentals } = data ?? {}
  if (![users, listings, rentals].every(Array.isArray)) {
    throw new Error('Mockaroo returned invalid data.')
  }

  const userIds = new Set(users.map((user) => user?.id))
  const listingIds = new Set(listings.map((listing) => listing?.id))
  const rentalIds = new Set(rentals.map((rental) => rental?.id))
  const validUsers = users.every((user) => typeof user?.id === 'string' && user.id.trim())
  const validListings = listings.every((listing) =>
    Number.isSafeInteger(listing?.id) && listing.id > 0 &&
    userIds.has(listing.ownerId) && listingCategories.includes(listing.category) &&
    listingStatuses.includes(listing.status) &&
    [listing.title, listing.description, listing.rentalTerms].every((value) => typeof value === 'string' && value.trim()) &&
    Number.isFinite(listing.price) && listing.price >= 0,
  )
  const validRentals = rentals.every((rental) =>
    Number.isSafeInteger(rental?.id) && rental.id > 0 &&
    listingIds.has(rental.listingId) && userIds.has(rental.borrowerId) &&
    listings.find((listing) => listing.id === rental.listingId)?.ownerId === rental.ownerId &&
    rentalStatuses.includes(rental.status) &&
    Number.isFinite(rental.totalPrice) && rental.totalPrice >= 0 &&
    typeof rental.startDate === 'string' && typeof rental.endDate === 'string',
  )

  if (!validUsers || !validListings || !validRentals ||
    userIds.size !== users.length || listingIds.size !== listings.length || rentalIds.size !== rentals.length) {
    throw new Error('Mockaroo returned invalid data.')
  }
}

export function loadMockData() {
  if (!loading) {
    loading = fetch('/mock-api/dormshare.json', { signal: AbortSignal.timeout(15000) })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Could not load mock data (${response.status}).`)
        const data = await response.json()
        validateData(data)
        listings = data.listings
        rentals = data.rentals
      })
      .catch((error) => {
        loading = undefined
        throw error
      })
  }
  return loading
}

export function getListings() {
  return structuredClone(listings)
}

export function getRentals() {
  return structuredClone(rentals)
}

export function createListing(details) {
  const id = Math.max(0, ...listings.map((item) => item.id)) + 1
  const listing = {
    id,
    ownerId: 'owner-1',
    image: `https://picsum.photos/seed/dormshare-${id}/320/240`,
    ...details,
    status: 'draft',
  }

  listings = [listing, ...listings]
  return { ...listing }
}

export function updateListing(id, details) {
  const existingListing = listings.find((listing) => listing.id === id)
  if (!existingListing) return null

  const updatedListing = { ...existingListing, ...details }
  listings = listings.map((listing) =>
    listing.id === id ? updatedListing : listing,
  )

  return { ...updatedListing }
}

export function updateListingStatus(id, status) {
  const existingListing = listings.find((listing) => listing.id === id)
  if (!existingListing) return null

  const updatedListing = { ...existingListing, status }
  listings = listings.map((listing) =>
    listing.id === id ? updatedListing : listing,
  )

  return { ...updatedListing }
}
