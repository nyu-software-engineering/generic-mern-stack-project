/**
 * Mock data access for the front-end sprint.
 *
 * demoData.js holds normalized fixtures (cities, lists, users, etc.). Pages should
 * import from this file—not demoData directly—so joins and UI-shaped objects live
 * in one place until a real back-end replaces these functions.
 */

import { cities, lists, places, savedPlaces, users, votes, friendships, listInvites, currentUserId, linkLookups, categories } from './demoData.js'

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
 * Saved places for a city's demo list, ordered by must-go votes (then name).
 * Each place includes savedPlaceId and tally: { 'must-go', down, pass }.
 * Only list members' votes count. Assumes at most one list per city, like headers.
 */
export function getRankedCityPlaces(cityId) {
  const list = lists.find((item) => item.cityId === cityId)
  if (!list) return []

  return savedPlaces
    .filter((saved) => saved.listId === list.id)
    .flatMap((saved) => {
      const place = places.find((item) => item.id === saved.placeId)
      if (!place || place.cityId !== cityId) return []

      const tally = { 'must-go': 0, down: 0, pass: 0 }
      votes
        .filter((vote) => vote.savedPlaceId === saved.id && list.memberIds.includes(vote.userId))
        .forEach((vote) => {
          if (Object.hasOwn(tally, vote.value)) tally[vote.value] += 1
        })

      return [{ ...place, savedPlaceId: saved.id, tally }]
    })
    .sort((a, b) => b.tally['must-go'] - a.tally['must-go'] || a.name.localeCompare(b.name))
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

/** User shape for lists on screen (avatar + label). */
function toPublicUser(user) {
  if (!user) return null
  return { id: user.id, name: user.name, username: user.username, photoUrl: user.photoUrl }
}

/** All friends of `userId`, sorted by display name. */
export function getFriendsForUser(userId) {
  const friendIds = friendships
    .filter((friendship) => friendship.userIds.includes(userId))
    .map((friendship) => friendship.userIds.find((id) => id !== userId))

  return friendIds
    .map((id) => users.find((user) => user.id === id))
    .filter(Boolean)
    .map(toPublicUser)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** The single demo list for a city */
export function getListByCityId(cityId) {
  return lists.find((list) => list.cityId === cityId) ?? null
}

/**
 * Everything InviteToList needs
 */
export function getInviteToListData(cityId, userId = currentUserId) {
  const city = cities.find((item) => item.id === cityId)
  const list = getListByCityId(cityId)
  if (!city || !list) return null

  if (!list.memberIds.includes(userId)) {
    return { status: 'forbidden', cityId }
  }

  const memberIdSet = new Set(list.memberIds)
  const members = list.memberIds
    .map((id) => toPublicUser(users.find((user) => user.id === id)))
    .filter(Boolean)

  // Friends who are not already on this list
  const friendsToInvite = getFriendsForUser(userId).filter((friend) => !memberIdSet.has(friend.id))

  // disable friends who already have a pending invite to this list.
  const pendingInviteUserIds = new Set(
    listInvites
      .filter((invite) => invite.listId === list.id && invite.status === 'pending')
      .map((invite) => invite.toUserId),
  )

  const friendsWithInviteState = friendsToInvite.map((friend) => ({
    ...friend,
    alreadyInvited: pendingInviteUserIds.has(friend.id),
  }))

  return {
    status: 'ready',
    cityId: city.id,
    cityName: city.name,
    listId: list.id,
    description: list.description,
    inviteCode: list.inviteCode,
    invitePath: `/join/${list.inviteCode}`,
    members,
    friendsToInvite: friendsWithInviteState,
  }
}

/**
 * Sprint-1 mock: pretend we created list invites
 */
export function sendListInvites({ listId, fromUserId, toUserIds }) {
  return {
    ok: true,
    created: toUserIds.map((toUserId) => ({
      listId,
      fromUserId,
      toUserId,
      status: 'pending',
    })),
  }
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

function firstName(fullName) {
  return fullName.trim().split(/\s+/)[0]
}

/** Turn ["Samantha", "Tiffany", "Arjun"] into "Samantha, Tiffany, and Arjun". */
function formatNameList(names) {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

// categories like Food, Shopping, etc
export function getCategoryLabel(categoryId) {
  return categories.find((c) => c.id === categoryId)?.label ?? 'Other'
}

export function getPlaceById(placeId) {
  return places.find((p) => p.id === placeId) ?? null
}

export function getCityById(cityId) {
  return cities.find((c) => c.id === cityId) ?? null
}

/**
 * List the current user saves into for this city.
 */
export function getListForUserAndCity(userId, cityId) {
  return lists.find((list) => list.cityId === cityId && list.memberIds.includes(userId)) ?? null
}

/** Other people on the list, excluding the current user. */
export function getListViewerFirstNames(list, userId) {
  if (!list) return []
  return list.memberIds
    .filter((id) => id !== userId)
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean)
    .map((u) => firstName(u.name))
}
/**
 * "City information" that's in the wireframe
 */
export function getSharingMessage(cityId, userId = currentUserId) {
  const city = getCityById(cityId)
  const list = getListForUserAndCity(userId, cityId)
  const cityName = city?.name ?? 'city'
  let message = `Goes into your ${cityName} list.`
  const viewers = getListViewerFirstNames(list, userId)
  if (viewers.length > 0) {
    message += ` ${formatNameList(viewers)} will see it.`
  }
  return message
}

/** If this place is already saved on the user's list for that city, return the saved row. */
export function getDuplicateSavedPlace(placeId, userId = currentUserId) {
  const place = getPlaceById(placeId)
  if (!place) return null
  const list = getListForUserAndCity(userId, place.cityId)
  if (!list) return null
  return savedPlaces.find((sp) => sp.listId === list.id && sp.placeId === placeId) ?? null
}

/** Card data for Place Found / list rows */
export function getPlaceCardData(placeId, lookup) {
  const place = getPlaceById(placeId)
  if (!place) return null
  const city = getCityById(place.cityId)
  const categoryLabel = getCategoryLabel(place.categoryId)
  const platform = lookup?.platform
  return {
    placeId: place.id,
    name: place.name,
    subtitle: `${categoryLabel} - ${place.neighborhood}`,
    categoryLabel,
    cityId: place.cityId,
    cityName: city?.name ?? '',
    thumbnailUrl: lookup?.thumbnailUrl ?? place.photoUrl,
    platform,
    sourceTag: platform ? `From ${platform}` : null,
  }
}

/** Rows for "Did you mean?" candidate list. */
export function getAmbiguousCandidates(lookup) {
  if (!lookup?.candidates) return []
  return lookup.candidates.map((candidate) => {
    const place = getPlaceById(candidate.placeId)
    if (!place) return null
    return {
      placeId: place.id,
      name: place.name,
      subtitle: `${getCategoryLabel(place.categoryId)} - ${place.neighborhood}`,
      photoUrl: place.photoUrl,
      bestMatch: candidate.bestMatch === true,
    }
  }).filter(Boolean)
}

/** City id for an ambiguous lookup (from its first candidate). */
export function getLookupCityId(lookup) {
  const firstPlaceId = lookup?.candidates?.[0]?.placeId ?? lookup?.placeId
  const place = firstPlaceId ? getPlaceById(firstPlaceId) : null
  return place?.cityId ?? null
}

/**
 * Live search
 * Filters mock places in one city by name, neighborhood, or category label.
 */
export function searchPlacesInCity(cityId, query) {
  const q = query.trim().toLowerCase()
  const inCity = places.filter((p) => p.cityId === cityId)
  if (!q) return []
  return inCity
    .filter((place) => {
      const categoryLabel = getCategoryLabel(place.categoryId).toLowerCase()
      return (
        place.name.toLowerCase().includes(q)
        || place.neighborhood.toLowerCase().includes(q)
        || categoryLabel.includes(q)
      )
    })
    .map((place) => ({
      placeId: place.id,
      name: place.name,
      subtitle: `${getCategoryLabel(place.categoryId)} - ${place.neighborhood}`,
      photoUrl: place.photoUrl,
      bestMatch: false,
    }))
}

/**
 * Save a place onto the user's city list in memory (demoData arrays).
 * Creates a new list if the user does not have one for that city yet.
 */
export function savePlaceToList({ placeId, lookup, userId = currentUserId }) {
  const place = getPlaceById(placeId)
  if (!place) {
    return { ok: false, reason: 'missing_place' }
  }

  const duplicate = getDuplicateSavedPlace(placeId, userId)
  if (duplicate) {
    return { ok: false, reason: 'duplicate', savedPlaceId: duplicate.id, placeId }
  }

  let list = getListForUserAndCity(userId, place.cityId)
  if (!list) {
    const city = getCityById(place.cityId)
    list = {
      id: `l_${userId}_${place.cityId}`,
      cityId: place.cityId,
      ownerId: userId,
      memberIds: [userId],
      description: `${city?.name ?? 'City'} list.`,
      inviteCode: 'NEW-MOCK',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    lists.push(list)
  }

  const savedPlace = {
    id: `sp_${Date.now()}`,
    listId: list.id,
    placeId,
    savedBy: userId,
    sourcePlatform: lookup?.platform ?? 'Instagram',
    sourceUrl: lookup?.url ?? '',
    thumbnailUrl: lookup?.thumbnailUrl ?? place.photoUrl,
    savedAt: new Date().toISOString(),
  }
  savedPlaces.push(savedPlace)

  const city = getCityById(place.cityId)
  return {
    ok: true,
    placeId,
    placeName: place.name,
    cityId: place.cityId,
    cityName: city?.name ?? '',
    listId: list.id,
    savedPlaceId: savedPlace.id,
  }
}

/** @deprecated Use savePlaceToList */
export function mockSavePlaceToList(args) {
  return savePlaceToList(args)
}
