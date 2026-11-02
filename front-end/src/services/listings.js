import listings from '../data/listings'

export function getPublishedListings() {
  return listings.filter((listing) => listing.status === 'published')
}