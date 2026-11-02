export function mockResponse() {
  const listing = {
    id: 1, ownerId: 'owner-1', title: 'Desk lamp', category: 'Study supplies',
    description: 'Adjustable lamp.', price: 5, rentalTerms: 'Return clean.',
    status: 'published',
  }
  const statuses = ['requested', 'declined', 'confirmed', 'active', 'extension_requested', 'completed', 'cancelled']
  const rentals = statuses.map((status, index) => ({
    id: 101 + index, listingId: 1, ownerId: 'owner-1', borrowerId: 'student-2',
    startDate: '2026-11-05', endDate: '2026-11-07', status, totalPrice: 10,
    terms: { pricePerDay: 5, rentalTerms: 'Return clean.' }, extensionRequest: null,
  }))

  return {
    users: [
      { id: 'owner-1', name: 'Online owner' },
      { id: 'student-2', name: 'Online borrower' },
    ],
    listings: [listing, { ...listing, id: 2, ownerId: 'student-2', title: 'Projector', price: 9 }],
    rentals: [...rentals, { ...rentals[2], id: 201, listingId: 2, ownerId: 'student-2', borrowerId: 'owner-1', totalPrice: 18 }],
  }
}
