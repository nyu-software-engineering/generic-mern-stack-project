import axios from "axios";

const CURRENT_USER_KEY = "splitleaseCurrentUser";

// Checks the email and password against the members table from the mock API (set in .env).
// Returns the matching member, or null if nothing matches.
export const login = async (email, password) => {
  const { data: members } = await axios.get(
    import.meta.env.VITE_MEMBERS_API_URL,
  );
  const match = members.find(
    (m) =>
      m.email.toLowerCase() === email.trim().toLowerCase() &&
      m.password === password,
  );
  return match || null;
};

// Remembers who is logged in so other pages can use it (the password is never saved).
export const saveCurrentUser = (member) => {
  const user = {
    id: member.id,
    firstName: member.first_name,
    lastName: member.last_name,
    email: member.email,
    householdId: member.household_id,
  };
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch {
    // storage can be blocked (e.g. private browsing); the app still works without it
  }
};

// Returns the logged-in user, or null if nobody has logged in yet.
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
};
