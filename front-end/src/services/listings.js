import { api } from './api.js'
import { cacheListing, cacheOwnerListings, getListings } from './mockDataService.js'

export function getPublishedListings() {
  return getListings().filter((listing) => listing.status === 'published')
}

export async function getMyListings() {
  return cacheOwnerListings(await api('/listings/mine'))
}

export async function createListing(details) {
  return cacheListing(await api('/listings', { method: 'POST', body: details }))
}

export async function updateListing(id, details) {
  return cacheListing(await api(`/listings/${encodeURIComponent(id)}`, { method: 'PUT', body: details }))
}

export async function updateListingStatus(id, status) {
  return cacheListing(await api(`/listings/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } }))
}
