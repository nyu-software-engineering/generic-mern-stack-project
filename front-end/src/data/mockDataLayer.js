/**
 * Mock data access for the front-end sprint.
 *
 * demoData.js holds normalized fixtures (cities, lists, users, etc.). Pages should
 * import from this file—not demoData directly—so joins and UI-shaped objects live
 * in one place until a real back-end replaces these functions.
 */

import { cities, lists, savedPlaces, users } from './demoData.js'

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
 * Async loader for city headers. Data is in memory, but the Promise + AbortSignal
 * match how CityPage loads data today (loading state, retry, cancel on route change)
 * and mirror a future fetch() to the API.
 */
export function loadCityHeaders({ signal } = {}) {
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
      resolve(getCityHeaders())
    })
  })
}
