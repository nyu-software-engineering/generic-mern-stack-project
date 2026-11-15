import express from 'express';
import listingsRouter from "./data/listings.js";

const app = express();

app.use(express.json());

app.use("api/listings", listingsRouter)

export default app;
