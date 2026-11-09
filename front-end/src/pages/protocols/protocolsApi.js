import axios from "axios";
import { getCurrentUser } from "../login/authApi";

// Gets the household and its protocols from the mock API (set in .env)
// and turns them into the shape the Protocols page uses.
export const getHouseholdProtocols = async () => {
  const [membersRes, protocolsRes, households] = await Promise.all([
    axios.get(import.meta.env.VITE_MEMBERS_API_URL),
    axios.get(import.meta.env.VITE_PROTOCOLS_API_URL),
    // the households table is only used for the name, so the page still loads if it fails
    axios
      .get(import.meta.env.VITE_HOUSEHOLDS_API_URL)
      .then((res) => res.data)
      .catch(() => []),
  ]);

  // use the logged-in user's household; fall back to household 1 if nobody has logged in
  const user = getCurrentUser();
  const householdId = user ? user.householdId : 1;

  const allMembers = membersRes.data;
  const memberCount = Math.max(
    allMembers.filter((m) => m.household_id === householdId).length,
    1,
  );
  const householdRecord = Array.isArray(households)
    ? households.find((h) => h.id === householdId)
    : null;
  const householdName =
    (householdRecord && householdRecord.name) || `Household ${householdId}`;

  const nameOf = (id) => {
    const member = allMembers.find((m) => m.id === id);
    return member ? member.first_name : "A roommate";
  };

  const protocols = protocolsRes.data
    .filter((p) => p.household_id === householdId)
    .map((p) => ({
      id: p.id,
      name: p.name,
      proposedBy: nameOf(p.proposed_by),
      status: p.status,
      // keep approval counts consistent with how many people live in the household
      approvals:
        p.status === "approved"
          ? memberCount
          : Math.min(p.approvals, memberCount - 1),
    }));

  return {
    household: { id: householdId, name: householdName, memberCount },
    protocols,
  };
};
