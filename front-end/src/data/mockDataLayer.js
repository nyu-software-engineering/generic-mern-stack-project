/**
 * Mock data access for the front-end sprint.
 *
 * demoData.js holds normalized fixtures (cities, lists, users, etc.). Pages should
 * import from this file—not demoData directly—so joins and UI-shaped objects live
 * in one place until a real back-end replaces these functions.
 */

import { cities, lists, savedPlaces, users, currentUserId, linkLookups } from './demoData.js'

function createAbortError() {
  return new DOMException('The operation was aborted.', 'AbortError')
}

/**
 * Build the city header object used by CityHeader / CityPage.
 * Shape: { id, name, placeCount, members } where each member is
 * { id, name, photoUrl }.
 *
 * Assumes at most one list per city in the demo data.
 */
export function getCityHeader(cityId) {
  const city = cities.find((item) => item.id === cityId)
  if (!city) return null

  const list = lists.find((item) => item.cityId === cityId)
  const placeCount = list
    ? savedPlaces.filter((item) => item.listId === list.id).length
    : 0
  const members = (list?.memberIds ?? [])
    .map((userId) => users.find((user) => user.id === userId))
    .filter(Boolean)
    .map(({ id, name, photoUrl }) => ({ id, name, photoUrl }))

  return { id: city.id, name: city.name, placeCount, members }
}

/** Headers for every city in demoData, in the same order as cities. */
export function getCityHeaders() {
  return cities.map((city) => getCityHeader(city.id))
}

/**
 * Shared async wrapper: resolves getData() on a microtask, rejects with
 * AbortError if the signal fires first. Used by all load* functions so the
 * cancel/abort logic lives in one place.
 */
function loadAsync(getData, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError())
      return
    }

    const onAbort = () => {
      reject(createAbortError())
    }
    signal?.addEventListener('abort', onAbort, { once: true })

    queueMicrotask(() => {
      signal?.removeEventListener('abort', onAbort)
      if (signal?.aborted) return
      resolve(getData())
    })
  })
}

/** Headers for every city in demoData. Behavior unchanged; now uses loadAsync. */
export function loadCityHeaders(options) {
  return loadAsync(getCityHeaders, options)
}

/**
 * City headers only for lists the user is a member of.
 * Pending invites (listInvites) are intentionally excluded.
 */
export function getUserCityHeaders(userId) {
  return lists
    .filter((list) => list.memberIds.includes(userId))
    .map((list) => getCityHeader(list.cityId))
    .filter(Boolean)
}

/** Home screen loader. Uses the mock currentUserId until real auth exists. */
export function loadMyCityHeaders(options) {
  return loadAsync(() => getUserCityHeaders(currentUserId), options)
}

/**
 * Mock "drop the link" API for the Add Place screen.
 * Compares the pasted URL to linkLookups in demoData.
 */
export function lookupLinkByUrl(rawUrl) {
  const url = rawUrl.trim()
  if (!url) {
    return { status: 'empty' }
  }
  const lookup = linkLookups.find((item) => item.url === url)
  if (!lookup) {
    return { status: 'not_found' }
  }
  return { status: 'ok', lookup }
}
