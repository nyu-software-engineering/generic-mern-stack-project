import { listingCategories, listingStatuses, offerStatuses, rentalStatuses } from '../data/options.js'

export const CURRENT_USER_ID = 'owner-1'

let users = []
let listings = []
let rentals = []
let conversations = []
let loading

const sameId = (first, second) => String(first) === String(second)

function validateData(data) {
  const { users, listings, rentals, conversations } = data ?? {}
  if (![users, listings, rentals, conversations].every(Array.isArray)) {
    throw new Error('Mockaroo returned invalid data.')
  }

  const userIds = new Set(users.map((user) => user?.id))
  const listingIds = new Set(listings.map((listing) => listing?.id))
  const validUsers = users.every((user) =>
    typeof user?.id === 'string' && user.id.trim() &&
    typeof user.name === 'string' && user.name.trim() &&
    (user.completedRentals == null || (Number.isSafeInteger(user.completedRentals) && user.completedRentals >= 0)),
  )
  const validListings = listings.every((listing) =>
    Number.isSafeInteger(listing?.id) && listing.id > 0 &&
    userIds.has(listing.ownerId) && listingCategories.includes(listing.category) &&
    listingStatuses.includes(listing.status) &&
    [listing.title, listing.description, listing.rentalTerms].every((value) => typeof value === 'string' && value.trim()) &&
    Number.isFinite(listing.price) && listing.price >= 0,
  )
  const validRentals = validListings && rentals.every((rental) =>
    Number.isSafeInteger(rental?.id) && rental.id > 0 &&
    listingIds.has(rental.listingId) && userIds.has(rental.borrowerId) &&
    listings.find((listing) => listing.id === rental.listingId)?.ownerId === rental.ownerId &&
    rentalStatuses.includes(rental.status) &&
    Number.isFinite(rental.totalPrice) && rental.totalPrice >= 0 &&
    [rental.terms?.message, rental.terms?.rentalTerms].every((value) => value == null || typeof value === 'string') &&
    typeof rental.startDate === 'string' && typeof rental.endDate === 'string',
  )
  const validConversations = conversations.every((conversation) =>
    Number.isSafeInteger(conversation?.id) && listingIds.has(conversation.listingId) &&
    Array.isArray(conversation.participantIds) && conversation.participantIds.length === 2 &&
    conversation.participantIds.every((id) => userIds.has(id)) &&
    Array.isArray(conversation.messages) &&
    conversation.messages.every((message) =>
      Number.isSafeInteger(message?.id) &&
      conversation.participantIds.includes(message.senderId) &&
      typeof message.sentAt === 'string' &&
      (message.type === 'text'
        ? typeof message.text === 'string'
        : message.type === 'offer' && Number.isFinite(message.totalPrice) &&
          typeof message.startDate === 'string' && typeof message.endDate === 'string' &&
          offerStatuses.includes(message.status)),
    ),
  )

  if (!validUsers || !validListings || !validRentals || !validConversations ||
    userIds.size !== users.length || listingIds.size !== listings.length ||
    new Set(rentals.map((rental) => rental?.id)).size !== rentals.length) {
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
        users = data.users
        listings = data.listings
        rentals = data.rentals
        conversations = data.conversations
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
