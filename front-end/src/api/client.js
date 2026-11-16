// all requests to the back-end go through here
// pages shouldn't call fetch directly, add a function in api/<area>.js instead

const FALLBACK_URL = 'http://localhost:3000'
const BASE_URL = import.meta.env.VITE_API_URL || FALLBACK_URL

if (!import.meta.env.VITE_API_URL && import.meta.env.MODE !== 'test') {
  console.warn(`VITE_API_URL is not set. Using ${FALLBACK_URL}. Copy front-end/.env.example to front-end/.env.`)
}

// status 0 = couldn't reach the server at all
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    // we cancelled it ourselves, let the page ignore it
    if (err.name === 'AbortError') throw err
    // fetch only throws here if the server is down
    throw new ApiError("Can't reach the server. Is the back-end running?", 0)
  }

  // some routes might not send a body back
  const data = await response.json().catch(() => null)

  // back-end sends errors as { error: "..." }
  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status)
  }
  return data
}

// options is just { signal } for cancelling, it's optional
export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
}