import express from "express";
import { bookingsRouter } from "./routes/bookings.js";

export const app = express();

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/bookings", bookingsRouter);
