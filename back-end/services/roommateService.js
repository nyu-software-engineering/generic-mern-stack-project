const axios = require("axios")

const loadMockarooMembers = async () => {
    const response = await axios.get(process.env.MOCKAROO_MEMBERS_API_URL)
    return response.data
}

// The mock API has no balance data yet, so every roommate starts settled.
// Once balances are stored, this can return { memberId: amountOwed } for the household.
const loadNoBalances = async () => ({})

const toId = (value) => {
    const id = Number(value)
    return Number.isInteger(id) ? id : null
}

// Removes a roommate from a household once their move-out is settled.
// Returns { removed } on success, or { status, error } when the removal is not allowed.
// Nothing is saved until the database is added.
const removeRoommate = async (
    { householdId, memberId, requesterId } = {},
    loadMembers = loadMockarooMembers,
    loadBalances = loadNoBalances,
) => {
    const houseId = toId(householdId)
    const roommateId = toId(memberId)
    const removerId = toId(requesterId)

    if (houseId === null || roommateId === null || removerId === null) {
        return {
            status: 400,
            error: "householdId, memberId and requesterId must be numbers",
        }
    }

    if (roommateId === removerId) {
        return {
            status: 400,
            error: "You cannot remove yourself from the household",
        }
    }

    const members = await loadMembers()
    const inHousehold = (id) =>
        members.find((member) => member.id === id && member.household_id === houseId)

    if (!inHousehold(removerId)) {
        return {
            status: 403,
            error: "Only members of this household can remove roommates",
        }
    }

    const roommate = inHousehold(roommateId)

    if (!roommate) {
        return {
            status: 404,
            error: "This person is not a member of the household",
        }
    }

    const balances = await loadBalances(houseId)
    const owed = Number(balances[roommateId] || 0)

    if (owed !== 0) {
        return {
            status: 409,
            error: `${roommate.first_name} still has an outstanding balance of $${Math.abs(owed).toFixed(2)}. Settle it before removing them.`,
        }
    }

    return {
        removed: {
            id: roommate.id,
            firstName: roommate.first_name,
            lastName: roommate.last_name,
            householdId: houseId,
        },
    }
}

module.exports = {
    removeRoommate,
}
