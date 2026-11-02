import { getListings } from './mockDataService.js'

export function getPublishedListings() {
  return getListings().filter((listing) => listing.status === 'published')
}