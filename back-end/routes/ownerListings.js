import { Router } from "express";
import { listingCategories, listingStatuses } from "../../shared/options.mjs";

export const ownerListingsRouter = Router();

ownerListingsRouter.param("id", async (request, response, next, id) => {
  const data = await request.app.locals.mockDataStore.load();
  const listing = data.listings.find((item) => String(item.id) === id);
  if (!listing) return response.status(404).json({ error: "Listing not found." });
  if (listing.ownerId !== request.currentUserId) {
    return response.status(403).json({ error: "You can only manage your own listings." });
  }
  request.ownerListing = listing;
  next();
});

function listingDetails(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { title, category, description, price, rentalTerms } = body;
  if (![title, description, rentalTerms].every((value) => typeof value === "string" && value.trim()) ||
      !listingCategories.includes(category) || !Number.isFinite(price) || price < 0) return null;

  return { title: title.trim(), category, description: description.trim(), price, rentalTerms: rentalTerms.trim() };
}

// Mount before the public listing router so /mine is not treated as an item ID.
ownerListingsRouter.get("/mine", async (request, response) => {
  const data = await request.app.locals.mockDataStore.load();
  response.json(data.listings.filter((listing) => listing.ownerId === request.currentUserId));
});

ownerListingsRouter.post("/", async (request, response) => {
  const details = listingDetails(request.body);
  if (!details) return response.status(400).json({ error: "Invalid listing details." });

  const data = await request.app.locals.mockDataStore.load();
  const id = Math.max(0, ...data.listings.map((listing) => listing.id)) + 1;
  const listing = {
    ...details,
    id,
    ownerId: request.currentUserId,
    image: `https://picsum.photos/seed/dormshare-${id}/320/240`,
    status: "draft",
  };
  data.listings.unshift(listing);
  response.status(201).json(listing);
});

ownerListingsRouter.put("/:id", (request, response) => {
  const details = listingDetails(request.body);
  if (!details) return response.status(400).json({ error: "Invalid listing details." });

  Object.assign(request.ownerListing, details);
  response.json(request.ownerListing);
});

ownerListingsRouter.patch("/:id/status", (request, response) => {
  const body = request.body;
  if (!body || typeof body !== "object" || Array.isArray(body) || !listingStatuses.includes(body.status)) {
    return response.status(400).json({ error: "Invalid listing status." });
  }

  request.ownerListing.status = body.status;
  response.json(request.ownerListing);
});
