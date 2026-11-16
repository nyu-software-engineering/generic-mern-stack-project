import { api } from './api.js'

export function getSavedListings() {
  return api('/saved-items')
}

export function saveListing(listingId) {
  return api('/saved-items', { method: 'POST', body: { listingId } })
}

export function unsaveListing(listingId) {
  return api('/saved-items', { method: 'DELETE', body: { listingId } })
}
