import { api } from './client.js'

export function loadInvitations(options) {
  return api.get('/api/invites', options)
}

export function respondToInvitation(id, response) {
  return api.post(`/api/invites/${encodeURIComponent(id)}/respond`, { response })
}
