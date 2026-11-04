export const currentUserId = "u_1";

export const categories = [
  { id: "food", label: "Food" },
  { id: "shopping", label: "Shopping" },
  { id: "viewpoint", label: "Viewpoint" },
  { id: "artsculture", label: "Arts & Culture" },
  { id: "nightlife", label: "Nightlife" },
  { id: "activities", label: "Activities" },
  { id: "other", label: "Other" },
];

export const SOURCE_PLATFORMS = ["TikTok", "Instagram"];

export const VOTE_OPTIONS = [
  { value: "must-go", label: "Must-go" },
  { value: "down", label: "I'm down" },
  { value: "pass", label: "Pass" },
];

// A place counts as a "must-go" once at least half the list's members voted must-go
// export const MUST_GO_THRESHOLD = 0.5;

export const DISCOVERABILITY_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "friends_of_friends", label: "Friends of friends" },
  { value: "nobody", label: "Nobody" },
];

const makeSettings = (overrides = {}) => ({
  notifications: { listInvites: true, votes: true, newPlaces: true, friendRequests: true },
  discoverability: "everyone",
  ...overrides,
});


export const users = [
  { id: "u_1", name: "Siyona Goel",    username: "siyona",   email: "siyona@example.com",   password: "password123", photoUrl: "https://picsum.photos/seed/siyona/200",   interests: ["food", "viewpoint", "activities"], settings: makeSettings(), createdAt: "2025-02-14" },
  { id: "u_2", name: "Samantha Chen",  username: "samantha", email: "samantha@example.com", password: "password123", photoUrl: "https://picsum.photos/seed/samantha/200", interests: ["food", "shopping"],               settings: makeSettings(), createdAt: "2025-01-20" },
  { id: "u_3", name: "John Logan",     username: "johnl",    email: "john@example.com",     password: "password123", photoUrl: "https://picsum.photos/seed/johnl/200",    interests: ["viewpoint", "nightlife"],         settings: makeSettings(), createdAt: "2025-05-03" },
  { id: "u_4", name: "Tiffany Miller", username: "tiffy",     email: "tiff@example.com",     password: "password123", photoUrl: "https://picsum.photos/seed/tiff/200",     interests: ["artsculture", "food"],            settings: makeSettings(), createdAt: "2025-09-11" },
  { id: "u_5", name: "Arjun Shah",     username: "arjunsh",  email: "arjun@example.com",    password: "password123", photoUrl: "https://picsum.photos/seed/arjunsh/200",  interests: ["nightlife", "shopping"],          settings: makeSettings({ discoverability: "friends_of_friends" }), createdAt: "2026-03-02" },
];

export const friendships = [
  { id: "f_1", userIds: ["u_1", "u_2"], since: "2025-03-01" },
  { id: "f_2", userIds: ["u_1", "u_4"], since: "2026-01-15" },
  { id: "f_3", userIds: ["u_1", "u_5"], since: "2026-06-30" },
  { id: "f_4", userIds: ["u_2", "u_3"], since: "2025-06-10" },
  { id: "f_5", userIds: ["u_2", "u_4"], since: "2025-10-01" },
  { id: "f_6", userIds: ["u_2", "u_5"], since: "2026-04-18" },
  { id: "f_7", userIds: ["u_3", "u_4"], since: "2026-02-07" },
  { id: "f_8", userIds: ["u_4", "u_5"], since: "2026-05-22" },
];

// status: "pending" | "accepted" | "declined"
export const friendRequests = [
  { id: "fr_1", fromUserId: "u_3", toUserId: "u_1", status: "pending", createdAt: "2026-10-25T12:00:00Z" },
];

export const cities = [
  { id: "c_nyc",   name: "New York", country: "United States", coordinates: { lat: 40.7128, lng: -74.006 }, summary: "Five boroughs, endless food, and a subway that runs 24/7." },
  { id: "c_paris", name: "Paris",    country: "France",        coordinates: { lat: 48.8566, lng: 2.3522 },  summary: "Best explored on foot, one arrondissement at a time. Book popular restaurants ahead." },
];

// Every place the app knows about, whether or not someone has saved it yet
export const places = [
  // Saved in the New York list
  { id: "p_1",  cityId: "c_nyc",   name: "Top of the Rock",             categoryId: "viewpoint",   neighborhood: "Midtown",            coordinates: { lat: 40.7593, lng: -73.9794 }, photoUrl: "https://picsum.photos/seed/p1/400" },
  { id: "p_2",  cityId: "c_nyc",   name: "Joe's Pizza",                 categoryId: "food",        neighborhood: "Greenwich Village",  coordinates: { lat: 40.7306, lng: -74.0021 }, photoUrl: "https://picsum.photos/seed/p2/400" },
  { id: "p_3",  cityId: "c_nyc",   name: "Artists & Fleas",             categoryId: "shopping",    neighborhood: "Williamsburg",       coordinates: { lat: 40.7197, lng: -73.9599 }, photoUrl: "https://picsum.photos/seed/p3/400" },
  { id: "p_4",  cityId: "c_nyc",   name: "Comedy Cellar",               categoryId: "nightlife",   neighborhood: "Greenwich Village",  coordinates: { lat: 40.7302, lng: -74.0005 }, photoUrl: "https://picsum.photos/seed/p4/400" },
  { id: "p_5",  cityId: "c_nyc",   name: "The Metropolitan Museum of Art", categoryId: "artsculture", neighborhood: "Upper East Side", coordinates: { lat: 40.7794, lng: -73.9632 }, photoUrl: "https://picsum.photos/seed/p5/400" },
  // Saved in the Paris list
  { id: "p_6",  cityId: "c_paris", name: "Sacré-Cœur",                  categoryId: "viewpoint",   neighborhood: "Montmartre",         coordinates: { lat: 48.8867, lng: 2.3431 },   photoUrl: "https://picsum.photos/seed/p6/400" },
  { id: "p_7",  cityId: "c_paris", name: "Du Pain et des Idées",        categoryId: "food",        neighborhood: "Canal Saint-Martin", coordinates: { lat: 48.8718, lng: 2.3634 },   photoUrl: "https://picsum.photos/seed/p7/400" },
  { id: "p_8",  cityId: "c_paris", name: "Merci",                       categoryId: "shopping",    neighborhood: "Le Marais",          coordinates: { lat: 48.8631, lng: 2.3658 },   photoUrl: "https://picsum.photos/seed/p8/400" },
  // Not saved yet, only reachable through linkLookups
  { id: "p_9",  cityId: "c_nyc",   name: "Katz's Delicatessen",         categoryId: "food",        neighborhood: "Lower East Side",    coordinates: { lat: 40.7222, lng: -73.9874 }, photoUrl: "https://picsum.photos/seed/p9/400" },
  { id: "p_10", cityId: "c_paris", name: "Septime",                     categoryId: "food",        neighborhood: "Bastille",           coordinates: { lat: 48.8533, lng: 2.3807 },   photoUrl: "https://picsum.photos/seed/p10/400" },
  { id: "p_11", cityId: "c_paris", name: "Boulangerie Utopie",          categoryId: "food",        neighborhood: "Haut-Marais",        coordinates: { lat: 48.8656, lng: 2.3698 },   photoUrl: "https://picsum.photos/seed/p11/400" },
  { id: "p_12", cityId: "c_paris", name: "Mamiche",                     categoryId: "food",        neighborhood: "Canal Saint-Martin", coordinates: { lat: 48.8723, lng: 2.3577 },   photoUrl: "https://picsum.photos/seed/p12/400" },
  { id: "p_13", cityId: "c_paris", name: "Poilâne",                     categoryId: "food",        neighborhood: "Saint-Germain",      coordinates: { lat: 48.851, lng: 2.329 },     photoUrl: "https://picsum.photos/seed/p13/400" },
];

export const lists = [
  { id: "l_1", cityId: "c_nyc",   ownerId: "u_3", memberIds: ["u_3", "u_2", "u_4", "u_5"], description: "Long weekend in New York. Vote on what makes the cut.", inviteCode: "NYC-9XW1", createdAt: "2026-08-02" },
  { id: "l_2", cityId: "c_paris", ownerId: "u_1", memberIds: ["u_1", "u_2", "u_4"],        description: "Paris in December.",                                   inviteCode: "PAR-7Q2K", createdAt: "2026-09-15" },
];

// status: "pending" | "accepted" | "declined"
export const listInvites = [
  { id: "li_1", listId: "l_1", fromUserId: "u_3", toUserId: "u_1", status: "pending", createdAt: "2026-10-26T19:30:00Z" },
];

// A place saved into a list
export const savedPlaces = [
  // New York
  { id: "sp_1", listId: "l_1", placeId: "p_1", savedBy: "u_3", sourcePlatform: "Instagram", sourceUrl: "https://www.instagram.com/p/topoftherock", thumbnailUrl: "https://picsum.photos/seed/sp1/600", savedAt: "2026-08-03T10:00:00Z" },
  { id: "sp_2", listId: "l_1", placeId: "p_2", savedBy: "u_2", sourcePlatform: "TikTok",    sourceUrl: "https://www.tiktok.com/@nyceats/3",        thumbnailUrl: "https://picsum.photos/seed/sp2/600", savedAt: "2026-10-26T13:05:00Z" },
  { id: "sp_3", listId: "l_1", placeId: "p_3", savedBy: "u_4", sourcePlatform: "TikTok",    sourceUrl: "https://www.tiktok.com/@nycweekend/4",     thumbnailUrl: "https://picsum.photos/seed/sp3/600", savedAt: "2026-10-02T14:50:00Z" },
  { id: "sp_4", listId: "l_1", placeId: "p_4", savedBy: "u_5", sourcePlatform: "Instagram", sourceUrl: "https://www.instagram.com/p/comedycellar", thumbnailUrl: "https://picsum.photos/seed/sp4/600", savedAt: "2026-10-12T22:10:00Z" },
  { id: "sp_5", listId: "l_1", placeId: "p_5", savedBy: "u_3", sourcePlatform: "Instagram", sourceUrl: "https://www.instagram.com/p/themet",       thumbnailUrl: "https://picsum.photos/seed/sp5/600", savedAt: "2026-10-18T11:30:00Z" },
  // Paris
  { id: "sp_6", listId: "l_2", placeId: "p_6", savedBy: "u_2", sourcePlatform: "TikTok",    sourceUrl: "https://www.tiktok.com/@parisviews/1",     thumbnailUrl: "https://picsum.photos/seed/sp6/600", savedAt: "2026-10-24T18:20:00Z" },
  { id: "sp_7", listId: "l_2", placeId: "p_7", savedBy: "u_2", sourcePlatform: "Instagram", sourceUrl: "https://www.instagram.com/p/dupain",       thumbnailUrl: "https://picsum.photos/seed/sp7/600", savedAt: "2026-10-21T09:10:00Z" },
  { id: "sp_8", listId: "l_2", placeId: "p_8", savedBy: "u_1", sourcePlatform: "Instagram", sourceUrl: "https://www.instagram.com/p/merciparis",   thumbnailUrl: "https://picsum.photos/seed/sp8/600", savedAt: "2026-10-23T15:00:00Z" },
];

// value: "must-go" | "down" | "pass".
export const votes = [
  // New York: 4 must-go / 3 must-go / 2 down / 1 down / no votes
  { id: "v_1",  savedPlaceId: "sp_1", userId: "u_3", value: "must-go" },
  { id: "v_2",  savedPlaceId: "sp_1", userId: "u_2", value: "must-go" },
  { id: "v_3",  savedPlaceId: "sp_1", userId: "u_4", value: "must-go" },
  { id: "v_4",  savedPlaceId: "sp_1", userId: "u_5", value: "must-go" },
  { id: "v_5",  savedPlaceId: "sp_2", userId: "u_3", value: "must-go" },
  { id: "v_6",  savedPlaceId: "sp_2", userId: "u_2", value: "must-go" },
  { id: "v_7",  savedPlaceId: "sp_2", userId: "u_5", value: "must-go" },
  { id: "v_8",  savedPlaceId: "sp_2", userId: "u_4", value: "pass" },
  { id: "v_9",  savedPlaceId: "sp_3", userId: "u_2", value: "down" },
  { id: "v_10", savedPlaceId: "sp_3", userId: "u_5", value: "down" },
  { id: "v_11", savedPlaceId: "sp_4", userId: "u_4", value: "down" },
  // Paris
  { id: "v_12", savedPlaceId: "sp_6", userId: "u_1", value: "must-go" },
  { id: "v_13", savedPlaceId: "sp_6", userId: "u_2", value: "must-go" },
  { id: "v_14", savedPlaceId: "sp_6", userId: "u_4", value: "down" },
  { id: "v_15", savedPlaceId: "sp_7", userId: "u_4", value: "down" },
  { id: "v_16", savedPlaceId: "sp_8", userId: "u_2", value: "must-go" },
];

export const notes = [
  { id: "n_1", savedPlaceId: "sp_2", userId: "u_3", text: "Get the plain slice. Don't overthink it.",          createdAt: "2026-10-26T15:00:00Z" },
  { id: "n_2", savedPlaceId: "sp_2", userId: "u_2", text: "The line looks long but moves fast.",               createdAt: "2026-10-26T16:20:00Z" },
  { id: "n_3", savedPlaceId: "sp_1", userId: "u_4", text: "Book a sunset slot, they sell out.",                createdAt: "2026-08-04T09:30:00Z" },
  { id: "n_4", savedPlaceId: "sp_6", userId: "u_2", text: "Go at sunset, then walk down through Montmartre.",  createdAt: "2026-10-24T18:40:00Z" },
];

export const visits = [
  { id: "vi_1", userId: "u_1", placeId: "p_6", visitedAt: "2024-07-12" },
  { id: "vi_2", userId: "u_1", placeId: "p_1", visitedAt: "2025-11-03" },
  { id: "vi_3", userId: "u_2", placeId: "p_1", visitedAt: "2025-11-03" },
  { id: "vi_4", userId: "u_2", placeId: "p_2", visitedAt: "2025-05-20" },
  { id: "vi_5", userId: "u_2", placeId: "p_6", visitedAt: "2023-09-08" },
];

// Mock results for "Drop the link"
export const linkLookups = [
  // New York: saves into John's list if you accept his invite, otherwise creates your own New York list
  { id: "lk_1", url: "https://www.tiktok.com/@nyceats/video/7301", platform: "TikTok", status: "found", placeId: "p_9", thumbnailUrl: "https://picsum.photos/seed/lk1/600" },
  // Paris: saves straight into your existing list
  { id: "lk_2", url: "https://www.instagram.com/p/septime-paris", platform: "Instagram", status: "found", placeId: "p_10", thumbnailUrl: "https://picsum.photos/seed/lk2/600" },
  // "Close. Which one is it?"
  {
    id: "lk_3",
    url: "https://www.instagram.com/reel/paris-croissant",
    platform: "Instagram",
    status: "ambiguous",
    thumbnailUrl: "https://picsum.photos/seed/lk3/600",
    keywords: ["croissant", "bakery", "marais"],
    candidates: [
      { placeId: "p_11", bestMatch: true },
      { placeId: "p_12", bestMatch: false },
      { placeId: "p_13", bestMatch: false },
    ],
  },
  { id: "lk_4", url: "https://www.tiktok.com/@random/video/0000", platform: "TikTok", status: "not_found" },
];