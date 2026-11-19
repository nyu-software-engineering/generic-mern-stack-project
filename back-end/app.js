const express = require("express");
const morgan = require("morgan");
const axios = require("axios");
const app = express();

const dotenv = require("dotenv");
dotenv.config({ quiet: true });

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

//validates asset data before POST route
const validateAsset = (req, res, next) => {
  const body = req.body || {};
  const errors = {};

  if (!body.name || String(body.name).trim() === "") {
    errors.name = "Asset name is required.";
  }

  if (body.price === undefined || String(body.price).trim() === "") {
    errors.price = "Price is required.";
  } else if (isNaN(Number(body.price)) || Number(body.price) <= 0) {
    errors.price = "Price must be a number greater than 0.";
  }

  if (!body.date || isNaN(Date.parse(body.date))) {
    errors.date = "Enter a valid date, e.g. 10/24/2026.";
  }

  if (!body.paidBy || String(body.paidBy).trim() === "") {
    errors.paidBy = "Enter at least one person who paid.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ status: "error", errors: errors });
  }

  next();
};

const addedAssets = [];

//HTTP GET request to assets
app.get("/api/assets", async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.API_ASSETS_URL}?key=${process.env.API_SECRET_KEY}`,
    );
    res.json([...addedAssets, ...response.data]);
  } catch (err) {
    // if the mock API is down or out of requests, still show the assets added here
    console.error("Error getting mock assets:", err.message);
    res.json(addedAssets);
  }
});

app.post("/api/assets", validateAsset, (req, res) => {
  const name = String(req.body.name).trim();
  const price = Number(req.body.price);
  const paidBy = String(req.body.paidBy).trim();

  const newAsset = {
    id: 1000 + addedAssets.length + 1,
    asset_name: name,
    description: `$${price} - paid by ${paidBy}`,
    price: price,
    date: req.body.date,
    paidBy: paidBy,
  };
  addedAssets.push(newAsset);

  res.status(201).json({ status: "success", asset: newAsset });
});

module.exports = app;
