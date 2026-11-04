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