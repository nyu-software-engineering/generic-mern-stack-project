import axios from "axios";

// Asks the back-end to remove a roommate from the household.
// requesterId is the logged-in user, so the back-end can check they belong to the household.
// Returns { removed } when it worked, or { error } when the removal is not allowed.
export const removeRoommate = async (householdId, memberId, requesterId) => {
  try {
    const { data } = await axios.delete(
      `/api/households/${householdId}/members/${memberId}`,
      { data: { requesterId } }
    );
    return data;
  } catch (error) {
    if (error.response && error.response.status < 500 && error.response.data) {
      return { error: error.response.data.error };
    }
    throw error;
  }
};
