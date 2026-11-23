import axios from "axios";

const CURRENT_USER_KEY = "splitleaseCurrentUser";

// Sends the email and password to the back-end, which checks them against the members list.
// Returns the logged-in user, or null if the email or password is wrong.
export const login = async (email, password) => {
  try {
    const { data } = await axios.post("/api/login", { email, password });
    return data.user;
  } catch (error) {
    if (error.response && error.response.status === 401) return null;
    throw error;
  }
};

// Sends the sign-up form to the back-end.
// Returns { user } when the account is created, or { errors } describing what to fix.
export const register = async (form) => {
  try {
    const { data } = await axios.post("/api/register", form);
    return { user: data.user };
  } catch (error) {
    const errors = error.response && error.response.data && error.response.data.errors;
    if (errors) return { errors };
    throw error;
  }
};

// Remembers who is logged in so other pages can use it (the password is never saved).
export const saveCurrentUser = (user) => {
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
