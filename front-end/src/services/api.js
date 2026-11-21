
 // Shared helper for calling the Express back-end. Services call api() instead of
 // fetch() so JSON bodies and errors work the same way everywhere.
 // Vite proxies '/api/...' during development; Express serves it in production.

const NOT_RUNNING = 'Could not reach the back-end. Is it running?'

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// api('/listings/mine') or api('/users/me', { token })
export async function api(path, { method = 'GET', body, token } = {}) {
  const options = { method, signal: AbortSignal.timeout(15000) }
  const headers = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  if (token) headers.Authorization = `Bearer ${token}`
  if (Object.keys(headers).length) options.headers = headers

  let response
  try {
    response = await fetch(`/api${path}`, options)
  } catch {
    throw new ApiError(NOT_RUNNING, 0)
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const fallback = response.status === 502 ? NOT_RUNNING : `Request failed (${response.status}).`
    throw new ApiError(data?.error ?? fallback, response.status, data?.errors)
  }

  if (response.status === 204) return null

  try {
    return await response.json()
  } catch {
    throw new ApiError('Could not read the response from the back-end.', response.status)
  }
}
