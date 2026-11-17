import express from 'express';
import listings from "./data/listings.js";
import authRoutes from "./routes/auth.js";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    req.userId = req.header("x-user-id") || "user1";
    next();
});

app.use(authRoutes);

app.get("/api/listings", (req, res) => {
    res.json(listings);
});


export default app;
