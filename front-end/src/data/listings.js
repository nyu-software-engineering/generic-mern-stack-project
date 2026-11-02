// Shared mock listings (schema from the Sprint 1 plan; status is draft | published | paused).
// Listings 1-4 match the owner dashboard mock data in PR #65. price is per day.
const listings = [
  {
    id: 1,
    ownerId: 'owner-1',
    title: 'Mini fridge',
    category: 'Appliances',
    description: 'Compact fridge in good condition.',
    price: 15,
    rentalTerms: 'Pick up from the owner. Return it clean.',
    status: 'published',
  },
  {
    id: 2,
    ownerId: 'owner-1',
    title: 'Desk lamp',
    category: 'Study supplies',
    description: 'Desk lamp with an adjustable arm.',
    price: 5,
    rentalTerms: 'Pick up from the owner. Return with the bulb.',
    status: 'published',
  },
  {
    id: 3,
    ownerId: 'owner-1',
    title: 'Study chair',
    category: 'Furniture',
    description: 'Comfortable chair for a desk.',
    price: 10,
    rentalTerms: 'Pick up from the owner.',
    status: 'paused',
  },
  {
    id: 4,
    ownerId: 'owner-1',
    title: 'Bike lock',
    category: 'Electronics',
    description: 'Combination bike lock.',
    price: 4,
    rentalTerms: 'Return with the combination unchanged.',
    status: 'draft',
  },
  {
    id: 5,
    ownerId: 'student-2',
    title: 'Portable projector',
    category: 'Electronics',
    description: 'Mini projector with charger, HDMI cable and case.',
    price: 9,
    rentalTerms: 'Use indoors; return with all accessories.',
    status: 'published',
  },
]

export default listings
