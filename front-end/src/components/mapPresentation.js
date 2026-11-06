// Presentation only: place records and category labels come from the mock layer.
export const categoryColors = {
  food: '#b94726',
  shopping: '#6954a3',
  viewpoint: '#247364',
  artsculture: '#a4436d',
  nightlife: '#4252a0',
  activities: '#936500',
  other: '#56616f',
}

export function hasValidCoordinates(coordinates) {
  return Number.isFinite(coordinates?.lat) && Math.abs(coordinates.lat) <= 90
    && Number.isFinite(coordinates?.lng) && Math.abs(coordinates.lng) <= 180
}

export function filterPlacesByCategory(places, categoryId) {
  return categoryId === 'all' ? places : places.filter((place) => place.categoryId === categoryId)
}
