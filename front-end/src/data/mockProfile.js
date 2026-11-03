// Mock data for the profile pages.
// My Profile (#45) shows this profile and Edit Profile (#46) edits it.
// Later this data will come from the back end instead of a file.

const mockProfile = {
  name: "Alp Ozbay",
  location: "New York, NY",
  bio: "NYU student who likes trying new activities around the city.",
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
