import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { currentUser } from "./middleware/currentUser.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { mockDataRouter } from "./routes/mockData.js";
import { createMockDataStore } from "./services/mockData.js";

const frontendDist = fileURLToPath(new URL("../front-end/dist/", import.meta.url));
const listingImages = fileURLToPath(
  new URL("../front-end/public/listing-images/", import.meta.url),
);

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
