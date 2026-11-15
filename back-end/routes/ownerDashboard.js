import { Router } from "express";
import { rentalStatuses } from "../../shared/options.mjs";

export const ownerDashboardRouter = Router();

ownerDashboardRouter.get("/dashboard", async (request, response) => {
  const query = request.query;
  const { search = "", status = "all" } = query;
  if (Object.keys(query).some((key) => !["search", "status"].includes(key)) ||
      typeof search !== "string" || typeof status !== "string" ||
      (status !== "all" && !rentalStatuses.includes(status))) {
    return response.status(400).json({ error: "Invalid dashboard filters." });
  }

  const searchText = search.trim().toLowerCase();
  const data = await request.app.locals.mockDataStore.load();
  const ownedRentals = data.rentals.filter((rental) => rental.ownerId === request.currentUserId);
  const listings = new Map(data.listings.map((listing) => [listing.id, listing]));
  const users = new Map(data.users.map((user) => [user.id, user]));
  let income = 0;
  let correction = 0;
  // Preserve low-order digits when adding many completed rental prices.
  for (const rental of ownedRentals) {
    if (rental.status !== "completed") continue;
    const price = rental.totalPrice - correction;
    const total = income + price;
    correction = (total - income) - price;
    income = total;
  }
  const summary = {
    totalRentals: ownedRentals.length,
    activeRentals: ownedRentals.filter((rental) => ["active", "extension_requested"].includes(rental.status)).length,
    // Compensate for floating-point error at half-cent boundaries.
    recordedIncome: Math.round((income + Number.EPSILON * Math.max(1, income)) * 100) / 100,
  };
  const filteredRentals = ownedRentals.filter((rental) => {
    if (status !== "all" && rental.status !== status) return false;
    return [listings.get(rental.listingId)?.title ?? "", users.get(rental.borrowerId)?.name ?? "", rental.borrowerId]
      .some((value) => value.toLowerCase().includes(searchText));
  });
  const rentals = filteredRentals.map((rental) => ({
    ...rental,
    listingTitle: listings.get(rental.listingId)?.title ?? "Listing unavailable",
    borrowerName: users.get(rental.borrowerId)?.name ?? rental.borrowerId,
  }));

  response.json({ summary, rentals });
});
