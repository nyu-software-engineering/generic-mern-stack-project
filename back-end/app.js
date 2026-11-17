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

app.delete("/api/saved/:listingId", (req, res) => {
    const listingId = Number(req.params.listingId);
    const index = savedIds.indexOf(listingId);

    if (index !== -1) {
        savedIds.splice(index, 1);
    }

    res.json(savedIds);
})

app.get("/api/listings/saved", (req,res) => {
    const savedListings = listings.filter(listing => savedIds.includes(listing.id));

    res.json(savedListings);
})

export default app;
