// Stand-in for posted flyers until they come from the API.
export const flyers = [
  {
    id: "ballroom-social",
    clubId: "ballroom",
    title: "Thursday Night Social",
    image: "https://picsum.photos/seed/flier-flyer-ballroom/600/800",
    date: "2026-11-12",
    time: "19:00",
    location: "Kimmel Center, Room 905",
    mapPosition: "left-[53%] top-[41%]",
    mapLabel: "Kimmel Center",
  },
  {
    id: "code-lab-hack-night",
    clubId: "code-lab",
    title: "Hack Night",
    image: "https://picsum.photos/seed/flier-flyer-code/600/800",
    date: "2026-11-18",
    time: "18:30",
    location: "60 5th Ave, Room 150",
    mapPosition: "left-[35%] top-[65%]",
    mapLabel: "60 Fifth Ave",
  },
  {
    id: "film-shorts",
    clubId: "film",
    title: "Student Shorts Screening",
    image: "https://picsum.photos/seed/flier-flyer-film/600/800",
    date: "2026-11-21",
    time: "20:00",
    location: "Tisch, 721 Broadway",
    mapPosition: "left-[69%] top-[74%]",
    mapLabel: "Tisch",
  },
];

// Feed flyers for the home page, calendar, and flyer detail.
// Today's Events use today's date so the home row and the calendar match.

function localNoon(dayOffset) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

const feedDetails = {
  location: "Kimmel Center",
  image: "https://picsum.photos/200/300",
  owner: "Club 1",
  description: "Join us for an event at Kimmel! Free food and merch provided.",
};

function feedFlyer(id, title, category, dayOffset) {
  return { id, title, category, starts_at: localNoon(dayOffset), ...feedDetails };
}

export const homeFlyers = [
  feedFlyer("1", "Event 1", "today", 0),
  feedFlyer("2", "Event 2", "today", 0),
  feedFlyer("3", "Event 3", "today", 0),
  feedFlyer("4", "Event 4", "today", 0),
  feedFlyer("5", "Event 5", "forYou", 3),
  feedFlyer("6", "Event 6", "forYou", 3),
  feedFlyer("7", "Event 7", "forYou", 3),
  feedFlyer("8", "Event 8", "forYou", 3),
  feedFlyer("9", "Event 9", "new", -2),
  feedFlyer("10", "Event 10", "new", -2),
  feedFlyer("11", "Event 11", "new", -2),
  feedFlyer("12", "Event 12", "new", -2),
];

export function flyersByCategory(category) {
  return homeFlyers.filter((item) => item.category === category);
}

export function flyerById(id) {
  return homeFlyers.find((item) => item.id === id);
}

export function eventDateKey(value) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
