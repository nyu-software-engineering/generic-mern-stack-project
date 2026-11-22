import { api, setSessionToken } from '../services/api.js'
import { setCurrentUserId } from '../services/mockDataService.js'

const PENDING_SIGNUP_KEY = 'dormshare-pending-verification'

export function readPendingSignup() {
  try {
    const stored = JSON.parse(
      globalThis.sessionStorage?.getItem(PENDING_SIGNUP_KEY) ?? 'null'
    )

    if (
      typeof stored?.email === 'string' &&
      /^[^\s@]+@nyu\.edu$/.test(stored.email) &&
      typeof stored.demoCode === 'string' &&
      /^\d{6}$/.test(stored.demoCode)
    ) {
      return {
        email: stored.email,
        demoCode: stored.demoCode,
      }
    }
  } catch {
    // Verification still works in memory if storage is unavailable.
  }

  return null
}

function savePendingSignup(pending) {
  try {
    if (pending?.demoCode) {
      globalThis.sessionStorage?.setItem(
        PENDING_SIGNUP_KEY,
        JSON.stringify(pending),
      )
    } else {
      globalThis.sessionStorage?.removeItem(PENDING_SIGNUP_KEY)
    }
  } catch {
    // Storage is optional for the Sprint 2 demo.
  }
}

export function createAuthSession({
  onCurrentUser,
  onPendingSignup,
}) {
  let lastRequestId = 0
  let invalidatedThrough = 0
  let pendingSignupRequestId = 0
  let verificationRequestId = 0
  let tokenRequestId = 0
  let token = null
  let pendingSignup = readPendingSignup()

  function updatePendingSignup(value, requestId = 0) {
    pendingSignup = value
    pendingSignupRequestId = requestId
    verificationRequestId = 0
    savePendingSignup(value)
    onPendingSignup(value)
  }

  async function signUp(fullName, email, password) {
    const requestId = ++lastRequestId

    const result = await api('/auth/signup', {
      method: 'POST',
      body: { fullName, email, password },
    })

    if (requestId <= invalidatedThrough) {
      throw new Error('Session changed. Please try again.')
    }

    updatePendingSignup({
      email: result.user.email,
      demoCode: result.demoCode,
    }, requestId)

    return result
  }

  async function verifyEmail(code) {
    const pending = pendingSignup

    if (!pending?.demoCode) {
      throw new Error('Please create an account first.')
    }

    const requestId = ++lastRequestId
    verificationRequestId = requestId

    const result = await api('/auth/verify', {
      method: 'POST',
      body: {
        email: pending.email,
        code,
      },
    })

    if (
      requestId <= invalidatedThrough ||
      pendingSignup !== pending
    ) {
      throw new Error('Session changed. Please try again.')
    }

    // Keep the email temporarily for the login form,
    // but clear the verification code from sessionStorage.
    updatePendingSignup({
      email: pending.email,
      demoCode: '',
    }, requestId)

    return result.user
  }

  async function signIn(email, password) {
    invalidatedThrough = lastRequestId
    const requestId = ++lastRequestId

    const session = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    const { user } = await api('/users/me', {
      token: session.token,
    })

    if (requestId <= invalidatedThrough) {
      throw new Error('Session changed. Please sign in again.')
    }

    token = session.token
    tokenRequestId = requestId
    setSessionToken(token)
    setCurrentUserId(user.id)

    onCurrentUser(user)
    updatePendingSignup(null)

    return user
  }

  async function updateProfile(displayName, campusArea) {
    const requestToken = token

    if (!requestToken) {
      throw new Error('Please sign in again.')
    }

    const requestId = ++lastRequestId
    const { user } = await api('/users/me', {
      method: 'PUT',
      body: { displayName, campusArea },
      token: requestToken,
    })

    if (
      requestId <= invalidatedThrough ||
      token !== requestToken
    ) {
      throw new Error('Session changed. Please sign in again.')
    }

    onCurrentUser(user)
    return user
  }

  function clearSignedInSession() {
    token = null
    tokenRequestId = 0

    setSessionToken(null)
    setCurrentUserId(null)
    onCurrentUser(null)
  }

  function signOut() {
    invalidatedThrough = ++lastRequestId
    clearSignedInSession()
    updatePendingSignup(null)
  }

  function prepareResetSignOut(email) {
    const startedRequestId = lastRequestId

    return () => {
      if (tokenRequestId > startedRequestId) return

      invalidatedThrough = Math.max(invalidatedThrough, startedRequestId)
      if (token) clearSignedInSession()
      if (pendingSignupRequestId > startedRequestId || verificationRequestId > invalidatedThrough) return
      if (pendingSignup?.demoCode && pendingSignup.email === email) return
      updatePendingSignup(null)
    }
  }

  return {
    signUp,
    verifyEmail,
    signIn,
    updateProfile,
    signOut,
    prepareResetSignOut,
  }
}
