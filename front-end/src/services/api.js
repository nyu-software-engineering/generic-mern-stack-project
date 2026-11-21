// Shared helper for calling the Express back-end.
// Vite proxies /api during development; Express serves it in production.

const NOT_RUNNING = 'Could not reach the back-end. Is it running?'

let activeSessionToken = null
let sessionRevision = 0

export function setSessionToken(token) {
  activeSessionToken = token || null
  sessionRevision += 1
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// Explicit token overrides the active session.
// Public authentication routes never inherit an existing session.
export async function api(path, { method = 'GET', body, token } = {}) {
  const inheritsSession = token === undefined && !path.startsWith('/auth/')
  const requestToken = token === undefined
    ? (inheritsSession ? activeSessionToken : null)
    : token
  const requestRevision = sessionRevision

  const ensureCurrentSession = () => {
    if (inheritsSession && requestRevision !== sessionRevision) {
      throw new ApiError('Session changed. Please try again.', 401)
    }
  }

  const options = {
    method,
    signal: AbortSignal.timeout(15000),
  }

  const headers = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  if (requestToken) {
    headers.Authorization = `Bearer ${requestToken}`
  }

  if (Object.keys(headers).length) {
    options.headers = headers
  }

  let response

  try {
    response = await fetch(`/api${path}`, options)
  } catch {
    throw new ApiError(NOT_RUNNING, 0)
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    ensureCurrentSession()

    const fallback = response.status === 502
      ? NOT_RUNNING
      : `Request failed (${response.status}).`

    throw new ApiError(
      data?.error ?? fallback,
      response.status,
      data?.errors,
    )
  }

  if (response.status === 204) {
    ensureCurrentSession()
    return null
  }

  let data

  try {
    data = await response.json()
  } catch {
    ensureCurrentSession()
    throw new ApiError(
      'Could not read the response from the back-end.',
      response.status,
    )
  }

  ensureCurrentSession()
  return data
}