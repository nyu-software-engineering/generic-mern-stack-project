import { api, ApiError } from './api.js'
import { cacheListing } from './mockDataService.js'

export async function searchListings({ search = '', category = '', signal } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  const query = params.toString()
  const listings = await api(query ? `/listings?${query}` : '/listings')
  // Existing save and booking flows still read from the shared client cache.
  if (!signal?.aborted) listings.forEach(cacheListing)
  return listings
}

export async function getPublicListing(id) {
  const listingId = Number(id)
  if (!Number.isSafeInteger(listingId) || listingId < 1 || String(listingId) !== String(id)) {
    throw new ApiError('Listing not found.', 404)
  }
  return api(`/listings/${listingId}`)
}
