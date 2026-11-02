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
    conversations: [{
      id: 1, listingId: 2, participantIds: ['student-2', 'owner-1'],
      messages: [
        { id: 1, senderId: 'owner-1', type: 'text', text: 'Is it free?', sentAt: '2026-11-01T09:00:00Z' },
        { id: 2, senderId: 'student-2', type: 'offer', totalPrice: 18, startDate: '2026-11-05',
          endDate: '2026-11-07', status: 'pending', sentAt: '2026-11-01T09:05:00Z' },
      ],
    }],
  }
}
