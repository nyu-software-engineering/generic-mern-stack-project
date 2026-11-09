import { getProfile } from './api.js'

// The profile is kept in this browser, the same way followed areas and share links are.
// The first time, it starts from the mock data. In Sprint 2 this moves to the back-end.
const profileStorageKey = 'leverage-profile'

export async function getMyProfile() {
  const savedProfile = window.localStorage.getItem(profileStorageKey)

  if (savedProfile) {
    return JSON.parse(savedProfile)
  }

  return getProfile()
}

export function saveMyProfile(profile) {
  window.localStorage.setItem(profileStorageKey, JSON.stringify(profile))
}