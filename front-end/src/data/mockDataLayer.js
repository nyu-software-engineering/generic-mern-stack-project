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

      const categoryLabel = categories.find((category) => category.id === place.categoryId)?.label ?? 'Other'
      return [{ ...place, categoryLabel, savedPlaceId: saved.id, tally }]
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

/** Names of cities where both users are on the list, e.g. ["Paris"]. */
function getSharedCityNames(userId, otherUserId) {
  return lists
    .filter((list) => list.memberIds.includes(userId) && list.memberIds.includes(otherUserId))
    .map((list) => cities.find((city) => city.id === list.cityId)?.name)
    .filter(Boolean)
}

/**
 * Friends tab (#107): every friend plus the cities you share lists in.
 * Shape: { id, name, username, photoUrl, sharedCities: string[] }
 */
export function getFriendsWithSharedCities(userId) {
  return getFriendsForUser(userId).map((friend) => ({
    ...friend,
    sharedCities: getSharedCityNames(userId, friend.id),
  }))
}

/**
 * Live username filter for the Friends tab. Case-insensitive, ignores a
 * leading "@", and an empty query returns everyone.
 */
export function filterFriendsByUsername(friends, query) {
  const wanted = query.trim().replace(/^@/, '').toLowerCase()
  if (!wanted) return friends
  return friends.filter((friend) => friend.username.toLowerCase().includes(wanted))
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

/** Shared category choices for list and map filters. */
export function getPlaceCategories() {
  return categories.map(({ id, label }) => ({ id, label }))
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

/**
 * Home "Most saved by friends" (#80).
 * Places the user's friends have saved, ranked by how many distinct friends saved
 * each one (ties: most recent save first, then name). The user's own saves and
 * saves by non-friends don't count.
 * Shape: { id, name, categoryId, categoryLabel, cityName, photoUrl,
 *          saveCount, savedByLabel, lastSavedAt }
 */
export function getMostSavedByFriends(userId, limit = 6) {
  const friends = getFriendsForUser(userId)
  const friendIds = new Set(friends.map((friend) => friend.id))

  // placeId -> { savers: Set of friend ids, lastSavedAt }
  const byPlace = new Map()
  savedPlaces
    .filter((saved) => friendIds.has(saved.savedBy))
    .forEach((saved) => {
      const entry = byPlace.get(saved.placeId) ?? { savers: new Set(), lastSavedAt: '' }
      entry.savers.add(saved.savedBy) // Set, so one friend saving twice counts once
      if (saved.savedAt > entry.lastSavedAt) entry.lastSavedAt = saved.savedAt
      byPlace.set(saved.placeId, entry)
    })

  return [...byPlace.entries()]
    .flatMap(([placeId, { savers, lastSavedAt }]) => {
      const place = getPlaceById(placeId)
      if (!place) return []

      const names = friends
        .filter((friend) => savers.has(friend.id))
        .map((friend) => firstName(friend.name))

      return [{
        id: place.id,
        name: place.name,
        categoryId: place.categoryId,
        categoryLabel: getCategoryLabel(place.categoryId),
        cityName: getCityById(place.cityId)?.name ?? '',
        photoUrl: place.photoUrl,
        saveCount: savers.size,
        // "Saved by Samantha", "Saved by Samantha and Tiffany", "Saved by 3 friends"
        savedByLabel: savers.size <= 2 ? `Saved by ${formatNameList(names)}` : `Saved by ${savers.size} friends`,
        lastSavedAt,
      }]
    })
    .sort((a, b) =>
      b.saveCount - a.saveCount
      || b.lastSavedAt.localeCompare(a.lastSavedAt)
      || a.name.localeCompare(b.name))
    .slice(0, limit)
}

/** Home loader for "Most saved by friends". Uses mock currentUserId until real auth exists. */
export function loadMostSavedByFriends(options) {
  return loadAsync(() => getMostSavedByFriends(currentUserId), options)
}

/**
 * Friend's Profile screen. `viewerId` is the person looking (current user).
 * Returns { status: 'self' } if you open your own id, { status: 'not_found' }
 * if the user doesn't exist or isn't your friend, otherwise { status: 'ready', ... }.
 */
export function getFriendProfile(viewerId, friendId, recentLimit = 5) {
  if (viewerId === friendId) return { status: 'self' }

  const friendship = friendships.find(
    (item) => item.userIds.includes(viewerId) && item.userIds.includes(friendId),
  )
  const profile = getUserProfile(friendId)
  if (!profile || !friendship) return { status: 'not_found' }

  // Lists you're both on. Only saves from these show up, since lists are private to members.
  const sharedLists = lists.filter(
    (list) => list.memberIds.includes(viewerId) && list.memberIds.includes(friendId),
  )
  const sharedListIds = new Set(sharedLists.map((list) => list.id))

  const recentlySaved = savedPlaces
    .filter((saved) => saved.savedBy === friendId && sharedListIds.has(saved.listId))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .slice(0, recentLimit)
    .flatMap((saved) => {
      const place = getPlaceById(saved.placeId)
      if (!place) return []
      return [{
        savedPlaceId: saved.id,
        placeId: place.id,
        name: place.name,
        cityName: getCityById(place.cityId)?.name ?? '',
        sourcePlatform: saved.sourcePlatform,
        thumbnailUrl: saved.thumbnailUrl ?? place.photoUrl,
        // Your vote on it, or null if you haven't voted
        myVote: votes.find((vote) => vote.savedPlaceId === saved.id && vote.userId === viewerId)?.value ?? null,
      }]
    })

  // Your lists the friend isn't on yet, flagged if an invite is already pending
  const pendingListIds = new Set(
    listInvites
      .filter((invite) => invite.toUserId === friendId && invite.status === 'pending')
      .map((invite) => invite.listId),
  )
  const invitableLists = lists
    .filter((list) => list.memberIds.includes(viewerId) && !list.memberIds.includes(friendId))
    .flatMap((list) => {
      const city = getCityById(list.cityId)
      if (!city) return []
      return [{ listId: list.id, cityId: city.id, cityName: city.name, alreadyInvited: pendingListIds.has(list.id) }]
    })

  return {
    status: 'ready',
    friend: { id: profile.id, name: profile.name, username: profile.username, photoUrl: profile.photoUrl },
    friendsSince: friendship.since,
    stats: {
      placesSaved: profile.stats.placesSaved,
      listsShared: sharedLists.length,
      placesVisited: profile.stats.placesVisited,
    },
    sharedCities: sharedLists
      .map((list) => getCityById(list.cityId))
      .filter(Boolean)
      .map((city) => ({ id: city.id, name: city.name })),
    recentlySaved,
    invitableLists,
  }
}
