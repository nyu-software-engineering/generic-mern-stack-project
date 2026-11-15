import { api, ApiError } from './api.js'

export function searchListings({ search = '', category = '' } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  const query = params.toString()
  return api(query ? `/listings?${query}` : '/listings')
}

export async function getPublicListing(id) {
  const listingId = Number(id)
  if (!Number.isSafeInteger(listingId) || listingId < 1 || String(listingId) !== String(id)) {
    throw new ApiError('Listing not found.', 404)
  }
  return api(`/listings/${listingId}`)
}
