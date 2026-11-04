// Mock events, in the same shape as the Explore page data.
// A category is added to each event - the filters (#34) need it,
// and the user story asks events to show their category.

const mockEvents = [
  {
    id: 1,
    title: "Weekend coffee meetup",
    date: "Sun",
    time: "3 PM",
    location: "West Village",
    category: "Social",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300",
  },
  {
    id: 2,
    title: "Museum afternoon",
    date: "Sat",
    time: "2 PM",
    location: "Chelsea",
    category: "Arts",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=300",
  },
  {
    id: 3,
    title: "Board game night",
    date: "Fri",
    time: "7 PM",
    location: "Manhattan",
    category: "Games",
    image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300",
  },
];

export default mockEvents;
