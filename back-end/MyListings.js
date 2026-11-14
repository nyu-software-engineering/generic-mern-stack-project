import express from 'express' 
import listings from "./data/listings.js";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    req.userId = req.header("x-user-id") || "user1";
    next();
});

app.get('/api/users/me/listings', (req,res) => {
    const myListing = listings.filter(listing => listing.ownerId === req.userId);
    res.json({
        active: myListing.filter(listing => listing.active),
        past: myListing.filter(listing => !listing.active),
    });
});