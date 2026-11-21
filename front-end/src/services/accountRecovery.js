import { api } from './api.js'

export function requestPasswordReset(email) {
  return api('/auth/forgot-password', { method: 'POST', body: { email } })
}

export function verifyPasswordResetCode(email, code) {
  return api('/auth/verify-reset-code', { method: 'POST', body: { email, code } })
}

export function resetPassword(resetToken, password) {
  return api('/auth/reset-password', { method: 'POST', body: { resetToken, password } })
}
