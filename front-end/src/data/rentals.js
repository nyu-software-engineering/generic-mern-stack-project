// Shared mock bookings/rentals (schema and statuses from the Sprint 1 plan).
// 101-103 match the owner dashboard mock data in PR #65.
// terms holds the agreed terms; chat offers (#53) can pass the same shape in.
const rentals = [
  {
    id: 101,
    listingId: 1,
    borrowerId: 'student-2',
    ownerId: 'owner-1',
    startDate: '2026-10-10',
    endDate: '2026-10-12',
    status: 'completed',
    terms: { pricePerDay: 15, rentalTerms: 'Pick up from the owner. Return it clean.' },
    totalPrice: 30,
    createdAt: '2026-10-08',
    extensionRequest: null,
  },
  {
    id: 102,
    listingId: 2,
    borrowerId: 'student-3',
    ownerId: 'owner-1',
    startDate: '2026-10-30',
    endDate: '2026-11-01',
    status: 'active',
    terms: { pricePerDay: 5, rentalTerms: 'Pick up from the owner. Return with the bulb.' },
    totalPrice: 10,
    createdAt: '2026-10-28',
    extensionRequest: null,
  },
  {
    id: 103,
    listingId: 1,
    borrowerId: 'student-4',
    ownerId: 'owner-1',
    startDate: '2026-11-03',
    endDate: '2026-11-05',
    status: 'requested',
    terms: { pricePerDay: 15, rentalTerms: 'Pick up from the owner. Return it clean.' },
    totalPrice: 30,
    createdAt: '2026-10-30',
    extensionRequest: null,
  },
  {
    id: 104,
    listingId: 5,
    borrowerId: 'owner-1',
    ownerId: 'student-2',
    startDate: '2026-11-16',
    endDate: '2026-11-18',
    status: 'confirmed',
    terms: {
      pricePerDay: 9,
      rentalTerms: 'Use indoors; return with all accessories.',
      message: 'For a small indoor event',
    },
    totalPrice: 18,
    createdAt: '2026-11-01',
    extensionRequest: null,
  },
]

export default rentals
