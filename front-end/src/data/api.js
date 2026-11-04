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

export function getMatch(jobId) {
  return request('/api/matches/' + encodeURIComponent(jobId))
}

async function post(path, body) {
  const response = await fetch(path, {
    method: 'POST',
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
