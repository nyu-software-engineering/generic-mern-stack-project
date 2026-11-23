import axios from "axios";

// Sends the new household's name to the back-end along with the logged-in user's id.
// Returns { household, inviteLink } when it worked, or { errors } when the form has a problem.
export const createHousehold = async (name, ownerId) => {
  try {
    const { data } = await axios.post("/api/households", { name, ownerId });
    return data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return { errors: error.response.data.errors };
    }
    throw error;
  }
};
