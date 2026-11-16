import { api } from './api.js'
import { cacheRentals } from './mockDataService.js'

export async function getMyRentals() {
  const rentals = await api('/rentals/mine')
  cacheRentals(rentals)
  return rentals
}
