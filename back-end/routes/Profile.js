import express from "express";
import users from "../data/users.js";
import listings from "../data/listings.js";
import reviews from "../data/reviews.js";

const app = express.Router();

app.use((req, res, next) => {
  req.userId = req.header("x-user-id") || "user1";
  next();
});

app.get("/api/users/me", (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json(user);
});

app.put("/api/users/me", (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const allowed = ["name", "bio", "school", "city", "photo"];
  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  }

  res.json(user);
});

app.get("/api/users/me/saved-listings", (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const saved = listings.filter(
    (listing) => user.savedListingIds.includes(listing.id) && listing.active
  );
  res.json(saved);
});

app.post("/api/users/me/saved-listings/:listingId", (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const listingId = Number(req.params.listingId);
  const exists = user.savedListingIds.includes(listingId);

  if (exists) {
    user.savedListingIds = user.savedListingIds.filter((id) => id !== listingId);
  } else {
    user.savedListingIds.push(listingId);
  }

  res.json({ savedListingIds: user.savedListingIds });
});


app.get("/api/users/me/reviews", (req, res) => {
  const myReviews = reviews.filter((r) => r.targetUserId === req.userId);
  res.json(myReviews);
});

app.post("/api/auth/logout", (req, res) => {
  res.status(204).end();
});

export default app;