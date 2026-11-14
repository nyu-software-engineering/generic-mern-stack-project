import express from 'express';
import listings from "./data/listings.js";

const app = express();

app.use(express.json());

app.get("/api/listings", (req, res) => {
    res.json(listings);
});

const savedIds = [];

app.post("/api/saved/:listingId", (req, res) => {
    const listingId = Number(req.params.listingId);

    if (!listings.some((listing) => listing.id === listingId)) {
        return res.status(404).json({ error: "Listing not found" });
    }

    if (!savedIds.includes(listingId)) {
        savedIds.push(listingId);
    }

    res.json(savedIds);
});

// app.get("api/listings/saved", (req,res) => {
//     //to-do
// })

export default app;
