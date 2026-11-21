// Every screen loads its data through these functions. Nothing is hard-coded in components.
// In Sprint 2 we point MOCK_BASE at the Express back-end and the screens do not change.
const MOCK_BASE = '/mock'
// Keep the demo links saved in this browser.
const shareLinksStorageKey = 'leverage-share-links'

const SERVER_HOSTNAME = import.meta.env.VITE_SERVER_HOSTNAME

// Calls the Express back-end. Pass { method: 'POST', body: {...} } to send data.
export async function request(path, options = {}) {
  const settings = { method: options.method || 'GET' }

  if (options.body) {
    settings.headers = { 'Content-Type': 'application/json' }
    settings.body = JSON.stringify(options.body)
  }

  const response = await fetch(`${SERVER_HOSTNAME}${path}`, settings)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || `Request to ${path} failed`)
  }

  return data
}

async function load(fileName) {
  const response = await fetch(`${MOCK_BASE}/${fileName}`)
  if (!response.ok) {
    throw new Error(`Could not load ${fileName}`)
  }
  return response.json()
}

export function getAreas() {
  return load('areas.json')
}

export async function getArea(areaId) {
  const areas = await getAreas()
  return areas.find(area => area.id === areaId)
}

export async function getRentTrend(areaId) {
  const trends = await load('rent-trends.json')
  return trends.find(trend => trend.areaId === areaId)
}

export async function getFollowedAreas() {
  const [followedIds, areas] = await Promise.all([
    load('followed-areas.json'),
    getAreas(),
  ])
  return areas.filter(area => followedIds.includes(area.id))
}

export function getApartmentChecks() {
  return request('/apartment-checks')
}

export async function getApartmentCheck(checkId) {
  // the server sends an error when no check has this id, so return nothing instead
  try {
    return await request(`/apartment-checks/${checkId}`)
  } catch {
    return undefined
  }
}

export async function getLatestApartmentCheck() {
  const checks = await getApartmentChecks()
  return checks[0]
}

export async function getComparables(checkId) {
  const comparables = await load('comparables.json')
  return comparables.filter(comparable => comparable.checkId === checkId)
}

export function getReport() {
  return load('report.json')
}

export async function getShareLinks() {
  const savedLinks = window.localStorage.getItem(shareLinksStorageKey)

  if (savedLinks) {
    return JSON.parse(savedLinks)
  }

  const mockLinks = await load('share-links.json')
  window.localStorage.setItem(shareLinksStorageKey, JSON.stringify(mockLinks))
  return mockLinks
}

export function saveShareLinks(links) {
  window.localStorage.setItem(shareLinksStorageKey, JSON.stringify(links))
}

export async function addShareLink(newLink) {
  const links = await getShareLinks()

  if (links.some(link => link.id === newLink.id)) {
    return links
  }

  const updatedLinks = [newLink, ...links]
  saveShareLinks(updatedLinks)
  return updatedLinks
}

export async function getNotifications() {
  const notifications = await load('notifications.json')
  return [...notifications].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export function getProfile() {
  return load('profile.json')
}

export async function getReceivedReports() {
  const reports = await load('received-reports.json')
  return [...reports].sort((a, b) => b.sharedOn.localeCompare(a.sharedOn))
}

export async function getSharedReport(reportId) {
  const reports = await load('shared-reports.json')
  return reports.find(report => report.id === reportId)
}

export function signUp(account) {
  return request('/auth/signup', { method: 'POST', body: account })
}

export function logIn(credentials) {
  return request('/auth/login', { method: 'POST', body: credentials })
}

export function logOut() {
  return request('/auth/logout', { method: 'POST' })
}

export function forgotPassword(email) {
  return request('/auth/forgot-password', { method: 'POST', body: { email } })
}

export function resetPassword(passwords) {
  return request('/auth/reset-password', { method: 'POST', body: passwords })
}
