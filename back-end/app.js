import express from "express";
import { currentUser } from "./middleware/currentUser.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { mockDataRouter } from "./routes/mockData.js";
import { createMockDataStore } from "./services/mockData.js";

export function createApp({ store = createMockDataStore() } = {}) {
  const app = express();
  app.locals.mockDataStore = store;
  app.use(express.json());
  app.use(currentUser);

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.use("/api", mockDataRouter);
  app.use("/api", (_request, response) => {
    response.status(404).json({ error: "API route not found." });
  });
  app.use(errorHandler);

  return app;
}

export const app = createApp();
