import { validateMockData } from '../../../shared/validateMockData.mjs'
import { api } from './api.js'

export let CURRENT_USER_ID = 'owner-1'

export function setCurrentUserId(id) {
  CURRENT_USER_ID = id || 'owner-1'
}

let users = []
let listings = []
let rentals = []
let conversations = []
let reviews = []
let itemRequests = []
let quickBorrowRequests = []
let loading

const sameId = (first, second) => String(first) === String(second)

export function loadMockData() {
  if (!loading) {
    // The back-end fetches the shared Mockaroo data and keeps the API key private.
    loading = api('/mock-data')
      .then((data) => {
        validateMockData(data)

        users = data.users
        listings = data.listings
        rentals = data.rentals
        conversations = data.conversations
        reviews = data.reviews
        itemRequests = data.itemRequests
        quickBorrowRequests = data.quickBorrowRequests ?? []
      })
      .catch((error) => {
        loading = undefined
        throw error
      })
  }

  return loading
}

export function getUser(id) {
  const user = users.find((item) => sameId(item.id, id))
  return user ? structuredClone(user) : undefined
}

// A full owner response also removes records lost after a backend restart.
export function cacheOwnerListings(ownerListings) {
  const cached = structuredClone(ownerListings)
  const ids = new Set(cached.map((listing) => String(listing.id)))
  const otherListings = listings.filter((listing) =>
    !sameId(listing.ownerId, CURRENT_USER_ID) && !ids.has(String(listing.id)),
  )
  listings = [...cached, ...otherListings]
  return structuredClone(cached)
}

export function getListings() {
  return structuredClone(listings)
}

export function getListingsForOwner(ownerId) {
  return getListings().filter((listing) => sameId(listing.ownerId, ownerId))
}

// Keep legacy readers current after a successful listing API response.
export function cacheListing(listing) {
  const cached = structuredClone(listing)
  const exists = listings.some((item) => sameId(item.id, cached.id))
  listings = exists
    ? listings.map((item) => sameId(item.id, cached.id) ? cached : item)
    : [cached, ...listings]
  return structuredClone(cached)
}

export function getRentals() {
  return structuredClone(rentals)
}

export function cacheRentals(fetchedRentals) {
  const rentalsById = new Map(rentals.map((rental) => [String(rental.id), rental]))
  for (const rental of fetchedRentals) {
    rentalsById.set(String(rental.id), structuredClone(rental))
  }
  rentals = [...rentalsById.values()]
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

export function getConversations() {
  return structuredClone(conversations)
}

export function updateConversation(id, details) {
  const existingConversation = conversations.find((item) => sameId(item.id, id))
  if (!existingConversation) return null

  const updatedConversation = { ...existingConversation, ...details }
  conversations = conversations.map((item) =>
    sameId(item.id, id) ? updatedConversation : item,
  )

  return structuredClone(updatedConversation)
}

export function createConversation(details) {
  const id = Math.max(0, ...conversations.map((item) => item.id)) + 1
  const conversation = { ...details, id }

  conversations = [...conversations, conversation]
  return structuredClone(conversation)
}

// Quick Borrow requests from the shared Mockaroo data (not the ones saved in localStorage).
export function getSharedQuickBorrowRequests() {
  return structuredClone(quickBorrowRequests)
}

export function getItemRequests() {
  return structuredClone(itemRequests)
}

export function createItemRequest(details) {
  const id = Math.max(0, ...itemRequests.map((item) => item.id)) + 1
  const request = {
    requesterId: CURRENT_USER_ID,
    status: 'open',
    responses: [],
    createdAt: new Date().toISOString(),
    ...details,
    id,
  }

  itemRequests = [request, ...itemRequests]
  return structuredClone(request)
}

export function updateItemRequest(id, details) {
  const existingRequest = itemRequests.find((item) => sameId(item.id, id))
  if (!existingRequest) return null

  const updatedRequest = { ...existingRequest, ...details }
  itemRequests = itemRequests.map((item) =>
    sameId(item.id, id) ? updatedRequest : item,
  )

  return structuredClone(updatedRequest)
}

export function getReviews() {
  return structuredClone(reviews)
}

export function createReview(details) {
  const id = Math.max(0, ...reviews.map((item) => item.id)) + 1
  const review = { ...details, id }

  reviews = [review, ...reviews]
  return structuredClone(review)
}
