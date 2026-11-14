import express from 'express' 
import listings from "./data/listings.js";

const app = express();
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
})