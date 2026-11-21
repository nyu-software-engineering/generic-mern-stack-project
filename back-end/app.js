import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { currentUser } from "./middleware/currentUser.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { bookingsRouter } from "./routes/bookings.js";
import { conversationsRouter } from "./routes/conversations.js";
import { handoffRouter } from "./routes/handoff.js";
import { mockDataRouter } from "./routes/mockData.js";
import { ownerListingsRouter } from "./routes/ownerListings.js";
import { ownerDashboardRouter } from "./routes/ownerDashboard.js";
import { publicListingsRouter } from "./routes/publicListings.js";
import { communityRulesRouter, reportsRouter } from "./routes/reports.js";
import { createRenterDashboardRouter } from "./routes/renterDashboard.js";
import { createMockDataStore } from "./services/mockData.js";
import { accountRouter } from "./routes/accounts.js";
import { reviewsRouter } from "./routes/reviews.js";

const frontendDist = fileURLToPath(new URL("../front-end/dist/", import.meta.url));
const listingImages = fileURLToPath(
  new URL("../front-end/public/listing-images/", import.meta.url),
);

export function createApp({ store = createMockDataStore() } = {}) {
  const app = express();
  app.locals.mockDataStore = store;
  app.locals.auth = { credentials: new Map(), sessions: new Map() };
  app.use(express.json());
  app.use(currentUser);
  app.use("/api", accountRouter);
  app.use("/api", reviewsRouter);

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.use("/api", mockDataRouter);
  app.use("/api", createRenterDashboardRouter());
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/handoff", handoffRouter);
  app.use("/api/listings", ownerListingsRouter);
  app.use("/api/listings", publicListingsRouter);
  app.use("/api/owner", ownerDashboardRouter);
  app.use("/api/conversations", conversationsRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/community-rules", communityRulesRouter);
  app.use("/api", (_request, response) => {
    response.status(404).json({ error: "API route not found." });
  });
  app.use("/listing-images", express.static(listingImages), (_request, response) => {
    response.sendStatus(404);
  });
  app.use(express.static(frontendDist));
  app.get("/{*path}", (request, response, next) => {
    if (extname(request.path) || !request.accepts("html")) return next();

    response.sendFile("index.html", { root: frontendDist }, (error) => {
      if (error?.code === "ENOENT") return next();
      if (error) next(error);
    });
  });
  app.use(errorHandler);

  return app;
}

export const app = createApp();
