// Hard-coded mock data for the booking routes, shaped like the Mockaroo rentals
// the front-end already uses. Swap for the shared mock data from #88 when it lands.

const seedListings = [
  { id: 1, ownerId: "owner-1", title: "Mini fridge", price: 4, rentalTerms: "Return clean and empty." },
  { id: 2, ownerId: "owner-2", title: "Desk lamp", price: 1.5, rentalTerms: "Bulb included." },
];

const seedRentals = [
  {
    id: 1,
    listingId: 1,
    ownerId: "owner-1",
    borrowerId: "student-1",
    startDate: "2026-11-20",
    endDate: "2026-11-23",
    status: "requested",
    terms: { pricePerDay: 4, rentalTerms: "Return clean and empty.", message: "Need it for the weekend." },
    totalPrice: 12,
    createdAt: "2026-11-10",
    extensionRequest: null,
  },
  {
    id: 2,
    listingId: 2,
    ownerId: "owner-2",
    borrowerId: "owner-1",
    startDate: "2026-11-01",
    endDate: "2026-11-15",
    status: "confirmed",
    terms: { pricePerDay: 1.5, rentalTerms: "Bulb included.", message: "" },
    totalPrice: 21,
    createdAt: "2026-10-30",
    extensionRequest: null,
  },
];

export let listings = [];
export let rentals = [];

// Restore the seed data. Called once on load and before each test.
export function resetBookingsData() {
  listings = structuredClone(seedListings);
  rentals = structuredClone(seedRentals);
}

resetBookingsData();
