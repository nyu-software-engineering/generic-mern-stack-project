import { api } from './client.js'

// PATCH /api/users/me/password
// fields is { currentPassword, newPassword }. Returns { ok: true }.
export function changeMyPassword(fields, options) {
  return api.patch('/api/users/me/password', fields, options)
}
