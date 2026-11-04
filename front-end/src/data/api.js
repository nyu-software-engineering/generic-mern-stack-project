async function request(path) {
  const response = await fetch(path, { headers: { Accept: 'application/json' } })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Could not load CareerHive data')
  return response.json()
}

export function getProfile() {
  return request('/api/profile')
}

export function getApplications() {
  return request('/api/applications')
}

export function getDiscussions() {
  return request('/api/discussions')
}

export function getDiscussion(jobId) {
  return request('/api/discussions/' + encodeURIComponent(jobId))
}

export async function getMatch(jobId, profile, options) {
  const match = await post('/api/matches/' + encodeURIComponent(jobId), { profile }, options)
  const strings = (items) => Array.isArray(items) && items.every((item) => typeof item === 'string')
  if (!match || match.jobId !== jobId || match.profileId !== profile.id || match.profileRevision !== profile.revision
    || typeof match.summary !== 'string' || (match.score !== null && (!Number.isFinite(match.score) || match.score < 0 || match.score > 100))
    || !['fitExplanation', 'missingSkills', 'keyQualifications'].every((field) => strings(match[field]))) {
    throw new Error('Invalid match response')
  }
  return match
}

async function post(path, body, { signal } = {}) {
  const response = await fetch(path, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not reach CareerHive. Please try again.')
  return data
}

export function logIn(email, password) {
  return post('/api/login', { email, password })
}

export function signUp(account) {
  return post('/api/signup', account)
}
