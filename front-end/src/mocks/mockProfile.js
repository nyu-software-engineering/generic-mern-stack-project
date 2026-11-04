// Mock data for the profile pages.
// My Profile (#45) shows this profile and Edit Profile (#46) edits it.
// Later this data will come from the back end instead of a file.

const mockProfile = {
  name: "Taylor Brooks",
  location: "New York, NY",
  bio: "Weekend explorer who loves trying new activities around the city.",
  imageUrl: "https://picsum.photos/seed/doin-profile/200/200",
  interests: ["Hiking", "Photography", "Cooking", "Live Music", "Soccer"],
};

// Every interest a user can pick from on the Edit Profile page.
const allInterests = [
  "Hiking",
  "Photography",
  "Cooking",
  "Live Music",
  "Soccer",
  "Reading",
  "Gaming",
  "Yoga",
];

export default mockProfile;
export { allInterests };
