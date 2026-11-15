import { Router } from "express";
import { listingCategories } from "../../shared/options.mjs";

export const publicListingsRouter = Router();

publicListingsRouter.get("/", async (request, response) => {
  const { search = "", category = "" } = request.query;
  if (typeof search !== "string" || typeof category !== "string" ||
      (category !== "" && !listingCategories.includes(category))) {
    return response.status(400).json({ error: "Invalid listing filters." });
  }

  const searchText = search.trim().toLowerCase();
  const { listings } = await request.app.locals.mockDataStore.load();
  const results = listings.filter((listing) =>
    listing.status === "published" &&
    (category === "" || listing.category === category) &&
    `${listing.title} ${listing.description}`.toLowerCase().includes(searchText),
  );

  response.json(results);
});

publicListingsRouter.get("/:id", async (request, response) => {
  const { listings } = await request.app.locals.mockDataStore.load();
  const listing = listings.find((item) =>
    item.status === "published" && String(item.id) === request.params.id,
  );

  if (!listing) return response.status(404).json({ error: "Listing not found." });
  response.json(listing);
});
