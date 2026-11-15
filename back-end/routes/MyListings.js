import express from 'express' 
import listings from "../data/listings.js";

const app = express.Router();

app.use(express.json());

app.use((req, res, next) => {
    req.userId = req.header("x-user-id") || "user1";
    next();
});

app.get("/api/users/me/listings", (req,res) => {
    const myListing = listings.filter(listing => listing.ownerId === req.userId);
    res.json({
        active: myListing.filter(listing => listing.active),
        past: myListing.filter(listing => !listing.active),
    });
});

app.delete("/api/users/me/listings/:listingId", (req,res) => {
    const index = listings.findIndex(listing => listing.id === Number(req.params.listingId));
    if (index === -1){
        return res.status(404).json({ error: "Listing not found." });
    }
    if (listings[index].ownerId != req.userId){
        return res.status(403).json({ error: "You can only delete your own listings." });
    }
    listings.splice(index, 1);
    res.status(204).end();
});

app.put("/api/listings/:listingId", (req, res) => {
    const listing = listings.find(listing => listing.id === Number(req.params.listingId));

    if (!listing) {
        return res.status(404).json({ error: "Listing not found." });
    }
    if (listing.ownerId !== req.userId) {
        return res.status(403).json({ error: "You can only edit your own listings." });
    }

    const allowed = ["title", "location", "price", "availability", "startDate", "endDate", "description", "image", "photos", "active"];
    for (const field of allowed) {
        if (req.body[field] !== undefined) {
            listing[field] = req.body[field];
        }
    }

    res.json(listing);
});

app.get("/api/listings/:listingId", (req,res) => {
    const listing = listings.find(listing => listing.id === Number(req.params.listingId));

    if (!listing || (!listing.active && listing.ownerId !== req.userId)) {
        return res.status(404).json({ error: "Listing not found." });
    }
    res.json(listing);
});

export default app;