import { getListings } from './mockDataService.js'

let savedItems = []

export function isListingSaved(userId, listingId) {
  return savedItems.some(
    (item) => item.userId === userId && item.listingId === listingId,
  )
}

export function saveListing(userId, listingId) {
  const listing = getListings().find((item) => item.id === listingId)

    if (!listing || listing.status !== 'published' || listing.ownerId === userId
  ) {
    return
  }

  if (!isListingSaved(userId, listingId)) {
    savedItems = [...savedItems, { userId, listingId }]
  }
}

export function unsaveListing(userId, listingId) {
  savedItems = savedItems.filter(
    (item) => !(item.userId === userId && item.listingId === listingId),
  )
}

export function getSavedListings(userId) {
  return getListings().filter(
    (listing) =>
      listing.status === 'published' &&
      isListingSaved(userId, listing.id),
  )
}