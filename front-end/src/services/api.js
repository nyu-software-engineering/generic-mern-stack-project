// Shared helper for calling the Express back-end. Services call api() instead of
// fetch() so JSON bodies and errors work the same way everywhere.
// Paths are relative ('/api/...'): Vite proxies them to the back-end in
// development, and Express serves the built app from the same origin.

const NOT_RUNNING = 'Could not reach the back-end. Is it running?'

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    // Per-field form errors, e.g. { title: 'Add a title.' }, when the route sends them.
    this.errors = errors
  }
}

// api('/listings/mine') or api('/listings', { method: 'POST', body: details })
export async function api(path, { method = 'GET', body } = {}) {
  const options = { method, signal: AbortSignal.timeout(15000) }
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`/api${path}`, options)
  } catch {
    throw new ApiError(NOT_RUNNING, 0)
  }

  if (!response.ok) {
    // Back-end routes send { error }. Vite's proxy sends an empty 502 when Express is down.
    const data = await response.json().catch(() => null)
    const fallback = response.status === 502 ? NOT_RUNNING : `Request failed (${response.status}).`
    throw new ApiError(data?.error ?? fallback, response.status, data?.errors)
  }
  if (response.status === 204) return null

  // A successful response must be readable JSON; callers should not get null by mistake.
  try {
    return await response.json()
  } catch {
    throw new ApiError('Could not read the response from the back-end.', response.status)
  }
}
