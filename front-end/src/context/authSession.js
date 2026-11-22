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
  let generation = 0
  let token = null
  let pendingSignup = readPendingSignup()

  function updatePendingSignup(value) {
    pendingSignup = value
    savePendingSignup(value)
    onPendingSignup(value)
  }

  async function signUp(fullName, email, password) {
    const startedGeneration = generation

    const result = await api('/auth/signup', {
      method: 'POST',
      body: { fullName, email, password },
    })

    if (generation !== startedGeneration) {
      throw new Error('Session changed. Please try again.')
    }

    updatePendingSignup({
      email: result.user.email,
      demoCode: result.demoCode,
    })

    return result
  }

  async function verifyEmail(code) {
    const pending = pendingSignup
    const startedGeneration = generation

    if (!pending?.demoCode) {
      throw new Error('Please create an account first.')
    }

    const result = await api('/auth/verify', {
      method: 'POST',
      body: {
        email: pending.email,
        code,
      },
    })

    if (
      generation !== startedGeneration ||
      pendingSignup !== pending
    ) {
      throw new Error('Session changed. Please try again.')
    }

    // Keep the email temporarily for the login form,
    // but clear the verification code from sessionStorage.
    updatePendingSignup({
      email: pending.email,
      demoCode: '',
    })

    return result.user
  }

  async function signIn(email, password) {
    const startedGeneration = ++generation

    const session = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    const { user } = await api('/users/me', {
      token: session.token,
    })

    if (generation !== startedGeneration) {
      throw new Error('Session changed. Please sign in again.')
    }

    token = session.token
    setSessionToken(token)
    setCurrentUserId(user.id)

    onCurrentUser(user)
    updatePendingSignup(null)

    return user
  }

  async function updateProfile(displayName, campusArea) {
    const requestToken = token
    const startedGeneration = generation

    if (!requestToken) {
      throw new Error('Please sign in again.')
    }

    const { user } = await api('/users/me', {
      method: 'PUT',
      body: { displayName, campusArea },
      token: requestToken,
    })

    if (
      generation !== startedGeneration ||
      token !== requestToken
    ) {
      throw new Error('Session changed. Please sign in again.')
    }

    onCurrentUser(user)
    return user
  }

  function signOut() {
    generation += 1
    token = null

    setSessionToken(null)
    setCurrentUserId(null)
    onCurrentUser(null)
    updatePendingSignup(null)
  }

  return {
    signUp,
    verifyEmail,
    signIn,
    updateProfile,
    signOut,
  }
}