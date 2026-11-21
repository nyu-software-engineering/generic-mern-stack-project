const { categories, cities, lists, places, savedPlaces, users, votes } = require("../data/demoData");

function getUserLists(userId) {
  return lists.filter((list) => list.memberIds.includes(userId));
}

function getCityHeader(list) {
  const city = cities.find((item) => item.id === list.cityId);
  if (!city) return null;

  const members = list.memberIds
    .map((id) => users.find((user) => user.id === id))
    .filter(Boolean)
    .map(({ id, name, photoUrl }) => ({ id, name, photoUrl }));
  const placeCount = savedPlaces.filter((saved) => saved.listId === list.id).length;
  return { id: city.id, name: city.name, placeCount, members };
}

function getRankedPlaces(list, categoryId) {
  const ranked = [];
  for (const saved of savedPlaces.filter((item) => item.listId === list.id)) {
    const place = places.find((item) => item.id === saved.placeId && item.cityId === list.cityId);
    if (!place || (categoryId && place.categoryId !== categoryId)) continue;

    const tally = { "must-go": 0, down: 0, pass: 0 };
    for (const vote of votes) {
      if (vote.savedPlaceId === saved.id && list.memberIds.includes(vote.userId) && Object.hasOwn(tally, vote.value)) {
        tally[vote.value] += 1;
      }
    }
    const categoryLabel = categories.find((category) => category.id === place.categoryId)?.label ?? "Other";
    ranked.push({ ...place, savedPlaceId: saved.id, categoryLabel, tally });
  }
  return ranked.sort((a, b) => b.tally["must-go"] - a.tally["must-go"] || a.name.localeCompare(b.name));
}

module.exports = { getUserLists, getCityHeader, getRankedPlaces };
