import { getAreas, getFollowedAreas } from './api.js'

// Followed areas are kept in this browser, the same way share links are in api.js.
// The first time, they start from the mock data. In Sprint 2 this moves to the back-end.
const followedAreasStorageKey = 'leverage-followed-areas'

function saveFollowedIds(ids) {
  window.localStorage.setItem(followedAreasStorageKey, JSON.stringify(ids))
}

async function getFollowedIds() {
  const savedIds = window.localStorage.getItem(followedAreasStorageKey)

  if (savedIds) {
    return JSON.parse(savedIds)
  }

  const mockAreas = await getFollowedAreas()
  const ids = mockAreas.map((area) => area.id)
  saveFollowedIds(ids)
  return ids
}

export async function isFollowingArea(areaId) {
  const ids = await getFollowedIds()
  return ids.includes(areaId)
}

export async function setFollowingArea(areaId, following) {
  const ids = await getFollowedIds()
  const updatedIds = following ? [...ids.filter((id) => id !== areaId), areaId] : ids.filter((id) => id !== areaId)
  saveFollowedIds(updatedIds)
  return updatedIds
}

export async function getMyFollowedAreas() {
  const [ids, areas] = await Promise.all([getFollowedIds(), getAreas()])
  return ids.map((id) => areas.find((area) => area.id === id)).filter(Boolean)
}