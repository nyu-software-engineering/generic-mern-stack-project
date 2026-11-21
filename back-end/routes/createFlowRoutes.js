/**
 * Create-flow routes.
 *
 * POST /api/links/lookup
 * GET  /api/places/:id/card
 * GET  /api/cities/:id/search?q=
 */

const express = require("express");
const {
  getCityById,
  getIdentifyingCard,
  findLinkLookupById,
  lookupLinkForApi,
  searchPlacesInCity,
} = require("../logic/createFlow");

const router = express.Router();

/**
 * Body: { url: "https://..." }
 *
 * HTTP is 200 for every result lookupLinkByUrl() knows how to return,
 * including "empty" and "not_found". Those words live in the JSON body.
 * They are not HTTP status codes. HTTP 400 is only for a missing or
 * non-string url.
 *
 * When body.status is "ok", body.lookup.status is a second status:
 *   found      -> Identifying
 *   ambiguous  -> Suggested Matches (body.candidates and body.cityId)
 *   not_found  -> the demo link exists, but it has no place
 */
router.post("/links/lookup", (req, res) => {
  const url = req.body && req.body.url;

  if (typeof url !== "string") {
    return res.status(400).json({ error: "Send a link to look up." });
  }

  res.json(lookupLinkForApi(url));
});

/**
 * Identifying page, in one call.
 * The JSON has every getPlaceCardData() field, plus:
 *   duplicate       saved-place row, or null
 *   sharingMessage  "Goes into your Paris list. ..."
 *
 * Optional: ?lookupId=lk_1
 * Pass the id from the lookup response when you still have the link.
 * That fills in the link photo and the "From TikTok" / "From Instagram" tag,
 * which is what getPlaceCardData(placeId, lookup) does on the page today.
 */
router.get("/places/:id/card", (req, res) => {
  let lookup = null;
  const lookupId = req.query.lookupId;

  if (lookupId !== undefined) {
    if (typeof lookupId !== "string" || lookupId.trim() === "") {
      return res.status(400).json({ error: "Send a link id like lk_1." });
    }

    lookup = findLinkLookupById(lookupId);
    if (!lookup) {
      return res.status(400).json({ error: "That link is not in the demo data." });
    }
  }

  const card = getIdentifyingCard(req.params.id, lookup);
  if (!card) {
    return res.status(404).json({ error: "Place not found" });
  }

  res.json(card);
});

/**
 * Live search on Suggested Matches.
 * :id is the city id, for example c_paris. ?q= is the text in the box.
 *
 * A city id that is not in the demo data is HTTP 404.
 * A real city with no matching text is HTTP 200 and [].
 * A missing q is the same as an empty search box: [].
 */
router.get("/cities/:id/search", (req, res) => {
  const city = getCityById(req.params.id);
  if (!city) {
    return res.status(404).json({ error: "City not found" });
  }

  const query = req.query.q;
  if (query !== undefined && typeof query !== "string") {
    return res.status(400).json({ error: "Search text has to be one string." });
  }

  res.json(searchPlacesInCity(city.id, query || ""));
});

module.exports = router;
