/**
 * Mock data access for the front-end sprint.
 *
 * demoData.js holds normalized fixtures (cities, lists, users, etc.). Pages should
 * import from this file—not demoData directly—so joins and UI-shaped objects live
 * in one place until a real back-end replaces these functions.
 */

import { categories, cities, lists, places, savedPlaces, users, visits, votes, friendships, listInvites, currentUserId, linkLookups } from './demoData.js'

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

/*
 * Functions for the place, profile and invite screens.
 *
 * Sprint 1 only: the "save" and "respond" functions below edit the demoData
 * records in place so the screens feel real while you click around. Nothing
 * is stored anywhere, so a page refresh puts everything back.
 */

/** Everything the place detail and edit-place screens need, or null if the place doesn't exist. */
export function getPlaceDetail(placeId) {
  const place = places.find((item) => item.id === placeId)
  if (!place) return null

  const city = cities.find((item) => item.id === place.cityId)
  const category = categories.find((item) => item.id === place.categoryId)
  // A place can exist without being saved yet, so everything from the saved entry is optional
  const saved = savedPlaces.find((item) => item.placeId === placeId)

  return {
    id: place.id,
    cityId: place.cityId,
    cityName: city?.name ?? '',
    name: place.name,
    categoryId: place.categoryId,
    categoryLabel: category?.label ?? 'Other',
    neighborhood: place.neighborhood,
    coordinates: place.coordinates,
    photoUrl: saved?.thumbnailUrl ?? place.photoUrl,
    sourcePlatform: saved?.sourcePlatform ?? null,
    sourceUrl: saved?.sourceUrl ?? null,
    savedBy: toPublicUser(users.find((user) => user.id === saved?.savedBy)),
  }
}

/** Sprint-1 mock of "correct this place". Returns { ok } or { ok: false, error }. */
export function updatePlaceDetails(placeId, { name, categoryId, neighborhood }) {
  const place = places.find((item) => item.id === placeId)
  if (!place) return { ok: false, error: 'This place no longer exists.' }
  if (!categories.some((item) => item.id === categoryId)) {
    return { ok: false, error: 'Pick a category from the list.' }
  }

  place.name = name.trim()
  place.categoryId = categoryId
  place.neighborhood = neighborhood.trim()
  return { ok: true }
}

/** Profile screen data: the user, their stats, their vibe tags and the city lists they belong to. */
export function getUserProfile(userId) {
  const user = users.find((item) => item.id === userId)
  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    photoUrl: user.photoUrl,
    interests: user.interests
      .map((interestId) => categories.find((category) => category.id === interestId)?.label)
      .filter(Boolean),
    stats: {
      placesSaved: savedPlaces.filter((saved) => saved.savedBy === userId).length,
      cityLists: lists.filter((list) => list.memberIds.includes(userId)).length,
      placesVisited: visits.filter((visit) => visit.userId === userId).length,
    },
    cities: getUserCityHeaders(userId).map(({ id, name, placeCount }) => ({ id, name, placeCount })),
  }
}

/** True if another user already has this username (case doesn't matter). */
export function isUsernameTaken(username, exceptUserId) {
  const wanted = username.trim().toLowerCase()
  return users.some((user) => user.id !== exceptUserId && user.username.toLowerCase() === wanted)
}

/** Sprint-1 mock of saving the edit profile form. Returns { ok } or { ok: false, error }. */
export function updateUserProfile(userId, { name, username, photoUrl }) {
  const user = users.find((item) => item.id === userId)
  if (!user) return { ok: false, error: 'We could not find your account.' }
  if (isUsernameTaken(username, userId)) return { ok: false, error: 'That username is taken.' }

  user.name = name.trim()
  user.username = username.trim()
  if (photoUrl) user.photoUrl = photoUrl
  return { ok: true }
}

/** Pending list invites sent to `userId`, shaped for the invitations inbox. */
export function getPendingInvites(userId) {
  return listInvites
    .filter((invite) => invite.toUserId === userId && invite.status === 'pending')
    .flatMap((invite) => {
      const list = lists.find((item) => item.id === invite.listId)
      const city = cities.find((item) => item.id === list?.cityId)
      // Skip invites that point at a list or city we can't find
      if (!list || !city) return []

      return [{
        id: invite.id,
        cityId: city.id,
        cityName: city.name,
        sender: toPublicUser(users.find((user) => user.id === invite.fromUserId)),
        placeCount: savedPlaces.filter((saved) => saved.listId === list.id).length,
        memberCount: list.memberIds.length,
      }]
    })
}

/**
 * Sprint-1 mock of accepting or declining an invite.
 * Accepting adds the user to the list, so the city shows up on their home screen.
 */
export function respondToInvite(inviteId, response) {
  const invite = listInvites.find((item) => item.id === inviteId)
  if (!invite || invite.status !== 'pending') {
    return { ok: false, error: 'This invite is no longer available.' }
  }
  if (response !== 'accept' && response !== 'decline') {
    return { ok: false, error: 'Unknown response.' }
  }

  const list = lists.find((item) => item.id === invite.listId)
  if (response === 'accept' && list && !list.memberIds.includes(invite.toUserId)) {
    list.memberIds.push(invite.toUserId)
  }
  invite.status = response === 'accept' ? 'accepted' : 'declined'
  return { ok: true, cityId: list?.cityId ?? null }
}
