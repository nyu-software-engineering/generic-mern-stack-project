const express = require("express");
const morgan = require("morgan");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();

const dotenv = require("dotenv");
dotenv.config({ quiet: true });

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin.startsWith("http://localhost:")) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const uploadDir = path.join(__dirname, "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      req.imageError = "The picture must be an image file (e.g. .jpg or .png).";
      cb(null, false);
    }
  },
});

const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      req.imageError =
        err.code === "LIMIT_FILE_SIZE"
          ? "The picture must be 5 MB or smaller."
          : "The picture could not be uploaded.";
    }
    next();
  });
};

let members = null;

const loadMembers = async () => {
  const response = await axios.get(
    `${process.env.API_MEMBERS_URL}?key=${process.env.API_SECRET_KEY}`,
  );
  members = response.data.map((m) => ({
    id: m.id,
    first_name: m.first_name,
    last_name: m.last_name,
    household_id: m.household_id,
  }));
  return members;
};

const getMembers = async () => members || loadMembers();

loadMembers().catch((err) =>
  console.error("Error getting members (will retry):", err.message),
);

app.get("/api/members", async (req, res) => {
  try {
    res.json(await getMembers());
  } catch (err) {
    console.error("Error getting members:", err.message);
    res.status(503).json({ status: "error", message: "Members unavailable." });
  }
});

const isLeapYear = (year) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (month, year) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};

const checkName = (value) => {
  const name = String(value ?? "").trim();
  if (name === "") return "Asset name is required.";
  if (name.length > 100) return "Asset name cannot exceed 100 characters.";
  return null;
};

const checkPrice = (value) => {
  const price = String(value ?? "").trim();
  if (price === "") return "Price is required.";
  if (price.startsWith("-")) return "Price cannot be negative.";
  if (!/^\d+(\.\d+)?$/.test(price)) return "Price must be a number.";
  if (!/^\d+(\.\d{1,2})?$/.test(price)) {
    return "Price can have at most two decimal places.";
  }
  return null;
};

const checkDate = (value) => {
  const date = String(value ?? "").trim();
  if (date === "") return "Date purchased is required.";

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  if (!match) return "Enter the date as MM/DD/YYYY, e.g. 10/24/2026.";

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const today = new Date();
  const currentYear = today.getFullYear();

  if (month < 1 || month > 12) return "Month must be between 01 and 12.";
  if (year < 1 || year > currentYear) {
    return `Year must be between 0001 and ${currentYear}.`;
  }
  if (day < 1 || day > daysInMonth(month, year)) {
    return `That month only has ${daysInMonth(month, year)} days.`;
  }

  const entered = year * 10000 + month * 100 + day;
  const now =
    currentYear * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  if (entered > now) return "Date purchased cannot be in the future.";

  return null;
};

const checkPaidBy = (value, memberList) => {
  const names = String(value ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n !== "");
  if (names.length === 0)
    return { error: "Enter at least one person who paid." };

  const matched = [];
  const unknown = [];
  names.forEach((n) => {
    const lower = n.toLowerCase();
    const member = memberList.find(
      (m) =>
        m.first_name.toLowerCase() === lower ||
        `${m.first_name} ${m.last_name}`.toLowerCase() === lower,
    );
    if (member) matched.push(`${member.first_name} ${member.last_name}`);
    else unknown.push(n);
  });

  if (unknown.length > 0) {
    return { error: `Not a household member: ${unknown.join(", ")}.` };
  }
  return { names: matched };
};

const validateAsset = async (req, res, next) => {
  const body = req.body || {};
  const errors = {};

  const nameError = checkName(body.name);
  if (nameError) errors.name = nameError;

  const priceError = checkPrice(body.price);
  if (priceError) errors.price = priceError;

  const dateError = checkDate(body.date);
  if (dateError) errors.date = dateError;

  try {
    const result = checkPaidBy(body.paidBy, await getMembers());
    if (result.error) errors.paidBy = result.error;
    else req.paidByNames = result.names;
  } catch (err) {
    console.error("Error getting members:", err.message);
    errors.paidBy = "Could not load the member list. Please try again.";
  }

  if (req.imageError) errors.image = req.imageError;

  if (Object.keys(errors).length > 0) {
    // don't keep a picture for an asset that wasn't created
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ status: "error", errors: errors });
  }

  next();
};

const addedAssets = [];

app.get("/api/assets", async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.API_ASSETS_URL}?key=${process.env.API_SECRET_KEY}`,
    );
    res.json([...addedAssets, ...response.data]);
  } catch (err) {
    console.error("Error getting mock assets:", err.message);
    res.json(addedAssets);
  }
});

app.post("/api/assets", uploadImage, validateAsset, (req, res) => {
  const name = String(req.body.name).trim();
  const price = Number(req.body.price);
  const paidBy = req.paidByNames.join(", ");

  const newAsset = {
    id: 1000 + addedAssets.length + 1,
    asset_name: name,
    description: `$${price.toFixed(2)} - paid by ${paidBy}`,
    price: price,
    date: String(req.body.date).trim(),
    paidBy: paidBy,
    image: req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null,
  };
  addedAssets.push(newAsset);

  res.status(201).json({ status: "success", asset: newAsset });
});

module.exports = app;
