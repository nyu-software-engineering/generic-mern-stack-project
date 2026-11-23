const axios = require("axios")

const loadMockarooMembers = async () => {
    const response = await axios.get(process.env.MOCKAROO_MEMBERS_API_URL)
    return response.data
}

// Checks an email and password against the members list.
// Returns the member without their password, or null if nothing matches.
const loginUser = async (email, password, loadMembers = loadMockarooMembers) => {
    const members = await loadMembers()
    const normalizedEmail = String(email).trim().toLowerCase()

    const match = members.find(
        (member) =>
            String(member.email).toLowerCase() === normalizedEmail &&
            member.password === password,
    )

    if (!match) {
        return null
    }

    return {
        id: match.id,
        firstName: match.first_name,
        lastName: match.last_name,
        email: match.email,
        householdId: match.household_id,
    }
}

module.exports = {
    loginUser,
}
