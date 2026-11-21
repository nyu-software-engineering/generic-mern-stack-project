const express = require("express");
const { currentUserId } = require("../data/demoData");
const { getUserLists, getCityHeader, getRankedPlaces } = require("../logic/cityLists");

const router = express.Router();

router.get("/lists", (req, res) => {
  res.json(getUserLists(currentUserId).map(getCityHeader).filter(Boolean));
});

router.param("cityId", (req, res, next, cityId) => {
  const list = getUserLists(currentUserId).find((item) => item.cityId === cityId);
  const header = list && getCityHeader(list);
  if (!header) return res.status(404).json({ error: "City list not found" });

  res.locals.list = list;
  res.locals.header = header;
  next();
});

router.get("/cities/:cityId", (req, res) => {
  res.json(res.locals.header);
});

router.get("/cities/:cityId/places", (req, res) => {
  res.json(getRankedPlaces(res.locals.list, req.query.category));
});

module.exports = router;
