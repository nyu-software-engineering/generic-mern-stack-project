import { api } from './api.js'

export function getMyRentals() {
  return api('/rentals/mine')
}
