const crypto = require("crypto")

const MAX_NAME_LENGTH = 50

// short code that roommates type on the Join Household page, e.g. "A3F9C1"
const makeInviteCode = () => crypto.randomBytes(3).toString("hex").toUpperCase()

// mock ids until households are saved in the database
let nextHouseholdId = 100

// Checks the new household's details and returns it with an invite code and invite link.
// Uses the same field names as the households mock API so the Join Household page can read it.
// Returns { errors } when something is wrong. Nothing is saved until the database is added.
const createHousehold = (form = {}, makeCode = makeInviteCode) => {
    const name = String(form.name || "").trim()
    const address = String(form.address || "").trim()
    const errors = {}

    if (!name) {
        errors.name = "Household name is required"
    } else if (name.length > MAX_NAME_LENGTH) {
        errors.name = `Household name must be ${MAX_NAME_LENGTH} characters or less`
    }

    if (Object.keys(errors).length > 0) {
        return { errors }
    }

    const inviteCode = makeCode()

    return {
        household: {
            household_id: nextHouseholdId++,
            household_name: name,
            address,
            invite_code: inviteCode,
            owner_id: form.ownerId ?? null,
        },
        inviteLink: `/join-household?code=${inviteCode}`,
    }
}

module.exports = {
    createHousehold,
    makeInviteCode,
}
