import { Router } from "express";

function isListingId(listingId) {
  return Number.isSafeInteger(listingId) && listingId > 0;
}

export function createRenterDashboardRouter() {
  const router = Router();
  const savedIdsByUser = new Map();

  router.get("/rentals/mine", async (request, response) => {
    const { listings, rentals } = await request.app.locals.mockDataStore.load();
    const listingTitles = new Map(listings.map(({ id, title }) => [id, title]));
    const borrowedRentals = rentals
      .filter((rental) => rental.borrowerId === request.currentUserId)
      .map((rental) => ({
        ...rental,
        listingTitle: listingTitles.get(rental.listingId) ?? "Listing unavailable",
      }));

    response.json(borrowedRentals);
  });

  router.get("/saved-items", async (request, response) => {
    const { listings } = await request.app.locals.mockDataStore.load();
    const savedIds = savedIdsByUser.get(request.currentUserId);
    response.json(listings.filter((listing) =>
      listing.status === "published" && savedIds?.has(listing.id),
    ));
  });

  router.post("/saved-items", async (request, response) => {
    const { listingId } = request.body ?? {};
    if (!isListingId(listingId)) {
      return response.status(400).json({ error: "A positive integer listingId is required." });
    }

    const userId = request.currentUserId;
    const { listings } = await request.app.locals.mockDataStore.load();
    const listing = listings.find((item) => item.id === listingId && item.status === "published");
    if (!listing) return response.status(404).json({ error: "Listing not found." });
    if (listing.ownerId === userId) {
      return response.status(403).json({ error: "You cannot save your own listing." });
    }

    let savedIds = savedIdsByUser.get(userId);
    if (!savedIds) {
      savedIds = new Set();
      savedIdsByUser.set(userId, savedIds);
    }
    if (savedIds.has(listingId)) return response.json(listing);

    savedIds.add(listingId);
    response.status(201).json(listing);
  });

  router.delete("/saved-items", (request, response) => {
    const { listingId } = request.body ?? {};
    if (!isListingId(listingId)) {
      return response.status(400).json({ error: "A positive integer listingId is required." });
    }

    const userId = request.currentUserId;
    const savedIds = savedIdsByUser.get(userId);
    if (savedIds?.delete(listingId) && savedIds.size === 0) savedIdsByUser.delete(userId);
    response.status(204).end();
  });

  return router;
}
