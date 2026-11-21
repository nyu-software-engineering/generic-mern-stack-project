/**
 * Data for the Create flow: look up a link, build the "Is this the place?"
 * card, and search places in one city.
 *
 * The fake data lives in data/demoData.js. "Me" is currentUserId (u_1)
 * until real login exists.
 */

const {
  categories,
  cities,
  places,
  lists,
  users,
  savedPlaces,
  linkLookups,
  currentUserId,
} = require("../data/demoData");

function getCategoryLabel(categoryId) {
  const category = categories.find((item) => item.id === categoryId);
  return category ? category.label : "Other";
}

function getPlaceById(placeId) {
  return places.find((place) => place.id === placeId) || null;
}

function getCityById(cityId) {
  return cities.find((city) => city.id === cityId) || null;
}

/** The list the user belongs to in this city, or null. */
function getListForUserAndCity(userId, cityId) {
  return (
    lists.find(
      (list) => list.cityId === cityId && list.memberIds.includes(userId)
    ) || null
  );
}

function firstName(fullName) {
  return fullName.trim().split(/\s+/)[0];
}

/** ["Samantha", "Tiffany"] becomes "Samantha and Tiffany". */
function formatNameList(names) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/** First names of the other people on the list. */
function getListViewerFirstNames(list, userId) {
  if (!list) return [];

  return list.memberIds
    .filter((id) => id !== userId)
    .map((id) => users.find((user) => user.id === id))
    .filter(Boolean)
    .map((user) => firstName(user.name));
}

/**
 * Same string the Identifying page shows under the card.
 * Example: "Goes into your Paris list. Samantha and Tiffany will see it."
 */
function getSharingMessage(cityId, userId = currentUserId) {
  const city = getCityById(cityId);
  const list = getListForUserAndCity(userId, cityId);
  const cityName = city ? city.name : "city";

  let message = `Goes into your ${cityName} list.`;
  const viewers = getListViewerFirstNames(list, userId);
  if (viewers.length > 0) {
    message += ` ${formatNameList(viewers)} will see it.`;
  }
  return message;
}

/**
 * The saved-place row if this user already saved this place, otherwise null.
 * The page treats any object as "already saved" and null as "not saved".
 */
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
 * Same object as getPlaceCardData(placeId, lookup).
 * lookup is optional. With no lookup, the photo is the place photo and
 * there is no "From TikTok" / "From Instagram" tag.
 */
function getPlaceCardData(placeId, lookup) {
  const place = getPlaceById(placeId);
  if (!place) return null;

  const city = getCityById(place.cityId);
  const categoryLabel = getCategoryLabel(place.categoryId);
  const platform = lookup ? lookup.platform : undefined;

  return {
    placeId: place.id,
    name: place.name,
    subtitle: `${categoryLabel} - ${place.neighborhood}`,
    categoryLabel,
    cityId: place.cityId,
    cityName: city ? city.name : "",
    thumbnailUrl: (lookup && lookup.thumbnailUrl) || place.photoUrl,
    platform,
    sourceTag: platform ? `From ${platform}` : null,
  };
}

/** One response for the Identifying page: card + duplicate + sharing line. */
function getIdentifyingCard(placeId, lookup) {
  const card = getPlaceCardData(placeId, lookup);
  if (!card) return null;

  return {
    ...card,
    // JSON has no "undefined", so a missing platform is sent as null.
    platform: card.platform || null,
    duplicate: getDuplicateSavedPlace(placeId),
    sharingMessage: getSharingMessage(card.cityId),
  };
}

/** Rows for the "Close. Which one is it?" list. [] when the link has no candidates. */
function getAmbiguousCandidates(lookup) {
  if (!lookup || !lookup.candidates) return [];

  return lookup.candidates
    .map((candidate) => {
      const place = getPlaceById(candidate.placeId);
      if (!place) return null;

      return {
        placeId: place.id,
        name: place.name,
        subtitle: `${getCategoryLabel(place.categoryId)} - ${place.neighborhood}`,
        photoUrl: place.photoUrl,
        bestMatch: candidate.bestMatch === true,
      };
    })
    .filter(Boolean);
}

/** City for Suggested Matches. Uses the first candidate, or the one found place. */
function getLookupCityId(lookup) {
  const firstCandidate = lookup && lookup.candidates && lookup.candidates[0];
  const placeId = (firstCandidate && firstCandidate.placeId) || (lookup && lookup.placeId);
  const place = placeId ? getPlaceById(placeId) : null;
  return place ? place.cityId : null;
}

/**
 * Same result as lookupLinkByUrl().
 *   { status: "empty" }
 *   { status: "not_found" }
 *   { status: "ok", lookup }
 *
 * "ok" only means the URL was in the demo list. Read lookup.status next:
 * "found", "ambiguous", or "not_found" mean three different screens.
 */

function lookupLinkByUrl(rawUrl) {
  const url = rawUrl.trim();
  if (!url) {
    return { status: "empty" };
  }

  const lookup = linkLookups.find((item) => item.url === url);
  if (!lookup) {
    return { status: "not_found" };
  }

  return { status: "ok", lookup };
}

/**
 * lookupLinkByUrl(), plus the two values Suggested Matches needs.
 * Those two fields are added only when status is "ok".
 * "empty" and "not_found" stay exactly the two small objects above.
 */
function lookupLinkForApi(rawUrl) {
  const result = lookupLinkByUrl(rawUrl);
  if (result.status !== "ok") {
    return result;
  }

  return {
    status: "ok",
    lookup: result.lookup,
    candidates: getAmbiguousCandidates(result.lookup),
    cityId: getLookupCityId(result.lookup),
  };
}

function findLinkLookupById(lookupId) {
  return linkLookups.find((item) => item.id === lookupId) || null;
}

/**
 * Same array as searchPlacesInCity(). An empty or blank query returns [].
 * Each row: { placeId, name, subtitle, photoUrl, bestMatch: false }.
 */
function searchPlacesInCity(cityId, query) {
  const q = String(query || "").trim().toLowerCase();
  const inCity = places.filter((place) => place.cityId === cityId);
  if (!q) return [];

  return inCity
    .filter((place) => {
      const categoryLabel = getCategoryLabel(place.categoryId).toLowerCase();
      return (
        place.name.toLowerCase().includes(q) ||
        place.neighborhood.toLowerCase().includes(q) ||
        categoryLabel.includes(q)
      );
    })
    .map((place) => ({
      placeId: place.id,
      name: place.name,
      subtitle: `${getCategoryLabel(place.categoryId)} - ${place.neighborhood}`,
      photoUrl: place.photoUrl,
      bestMatch: false,
    }));
}

module.exports = {
  getCityById,
  getIdentifyingCard,
  findLinkLookupById,
  lookupLinkForApi,
  searchPlacesInCity,
};
