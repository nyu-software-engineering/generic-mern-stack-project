/**
 * Save a place onto the current user's city list.
 *
 * This is the back-end copy of savePlaceToList() in
 * front-end/src/data/mockDataLayer.js. The fake lists and saved places
 * live in data/demoData.js. Pushing onto those arrays changes them only
 * in memory. A server restart puts the demo data back.
 */

const {
  cities,
  places,
  lists,
  savedPlaces,
  currentUserId,
  SOURCE_PLATFORMS,
} = require("../data/demoData");

function getPlaceById(placeId) {
  return places.find((place) => place.id === placeId) || null;
}

function getCityById(cityId) {
  return cities.find((city) => city.id === cityId) || null;
}

/** The list this user belongs to in this city, or null. */
function getListForUserAndCity(userId, cityId) {
  return (
    lists.find(
      (list) => list.cityId === cityId && list.memberIds.includes(userId)
    ) || null
  );
}

/** The saved row if this place is already on the user's list, or null. */
function getDuplicateSavedPlace(placeId, userId = currentUserId) {
  const place = getPlaceById(placeId);
  if (!place) return null;

  const list = getListForUserAndCity(userId, place.cityId);
  if (!list) return null;

  return (
    savedPlaces.find(
      (saved) => saved.listId === list.id && saved.placeId === placeId
    ) || null
  );
}

/**
 * Check the optional lookup object before we save.
 * The page can send the whole lookup from POST /api/links/lookup.
 * Only platform, url, and thumbnailUrl are stored.
 * lookup can be left out. The save then uses the place photo and Instagram.
 */
function prepareLookup(lookup) {
  if (lookup === undefined || lookup === null) {
    return { ok: true, lookup: undefined };
  }

  // Arrays are objects in JavaScript, so check for them on purpose.
  if (typeof lookup !== "object" || Array.isArray(lookup)) {
    return { ok: false, error: "Lookup info has to be an object." };
  }

  const platform = lookup.platform;
  const url = lookup.url;
  const thumbnailUrl = lookup.thumbnailUrl;

  if (platform !== undefined && typeof platform !== "string") {
    return { ok: false, error: "Platform has to be text." };
  }
  if (url !== undefined && typeof url !== "string") {
    return { ok: false, error: "The link url has to be text." };
  }
  if (thumbnailUrl !== undefined && typeof thumbnailUrl !== "string") {
    return { ok: false, error: "The thumbnail has to be text." };
  }

  // Categories and platforms come from demoData
  if (platform && !SOURCE_PLATFORMS.includes(platform)) {
    return { ok: false, error: "Pick TikTok or Instagram." };
  }

  return {
    ok: true,
    lookup: { platform, url, thumbnailUrl },
  };
}

/**
 * Same results as savePlaceToList({ placeId, lookup }).
 *
 * { ok: false, reason: "missing_place" }
 * { ok: false, reason: "duplicate", savedPlaceId, placeId }
 * { ok: true, placeId, placeName, cityId, cityName, listId, savedPlaceId }
 *
 * The route turns missing_place into HTTP 404 and duplicate into HTTP 409.
 */
function savePlaceToList({ placeId, lookup, userId = currentUserId }) {
  const place = getPlaceById(placeId);
  if (!place) {
    return { ok: false, reason: "missing_place" };
  }

  const duplicate = getDuplicateSavedPlace(placeId, userId);
  if (duplicate) {
    // The place is already on the list.
    return {
      ok: false,
      reason: "duplicate",
      savedPlaceId: duplicate.id,
      placeId,
    };
  }

  let list = getListForUserAndCity(userId, place.cityId);

  // Saving the first place in a city creates that city's list.
  // u_1 saving a New York place makes list id "l_u_1_c_nyc".
  if (!list) {
    const city = getCityById(place.cityId);
    const cityName = city ? city.name : "City";

    list = {
      id: `l_${userId}_${place.cityId}`,
      cityId: place.cityId,
      ownerId: userId,
      memberIds: [userId],
      description: `${cityName} list.`,
      inviteCode: "NEW-MOCK",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    lists.push(list);
  }

  const savedPlace = {
    id: `sp_${Date.now()}`,
    listId: list.id,
    placeId,
    savedBy: userId,
    sourcePlatform: (lookup && lookup.platform) || "Instagram",
    sourceUrl: (lookup && lookup.url) || "",
    thumbnailUrl: (lookup && lookup.thumbnailUrl) || place.photoUrl,
    savedAt: new Date().toISOString(),
  };
  savedPlaces.push(savedPlace);

  const city = getCityById(place.cityId);
  return {
    ok: true,
    placeId,
    placeName: place.name,
    cityId: place.cityId,
    cityName: city ? city.name : "",
    listId: list.id,
    savedPlaceId: savedPlace.id,
  };
}

module.exports = {
  prepareLookup,
  savePlaceToList,
};
