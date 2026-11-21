/**
 * Body:
 *   { placeId: "p_10" }
 *   { placeId: "p_9", lookup: { platform, url, thumbnailUrl } }
 *
 * placeId is required. lookup is optional.
 */

const express = require("express");
const { prepareLookup, savePlaceToList } = require("../logic/savedPlaces");

const router = express.Router();

router.post("/saved-places", (req, res) => {
  const rawPlaceId = req.body && req.body.placeId;
  const placeId = typeof rawPlaceId === "string" ? rawPlaceId.trim() : "";

  if (!placeId) {
    return res.status(400).json({ error: "Send a placeId." });
  }

  const prepared = prepareLookup(req.body.lookup);
  if (!prepared.ok) {
    return res.status(400).json({ error: prepared.error });
  }

  const result = savePlaceToList({
    placeId,
    lookup: prepared.lookup,
  });

  if (!result.ok && result.reason === "missing_place") {
    return res.status(404).json({ error: "Place not found" });
  }

  // The function says reason "duplicate". HTTP 409 means "already taken".
  // duplicate: true is the flag the page can check. The saved list is unchanged.
  if (!result.ok && result.reason === "duplicate") {
    return res.status(409).json({
      ...result,
      duplicate: true,
      error: "This place is already on your list.",
    });
  }

  // 200 and the same object savePlaceToList() returns.
  // listId is an existing list, or the list this request just created.
  res.json(result);
});

module.exports = router;
