import { api } from './api.js'

export function getOwnerDashboard({ search = '', status = 'all' } = {}) {
  const query = new URLSearchParams({ search, status })
  return api(`/owner/dashboard?${query}`)
}
