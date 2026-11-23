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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

// Checks the sign-up form and makes sure the email is not already used by a member.
// Returns { errors } when something is wrong, or { user } for the new account.
// Nothing is saved yet; accounts will be stored once the database is added.
const registerUser = async (form = {}, loadMembers = loadMockarooMembers) => {
    const name = String(form.name || "").trim()
    const email = String(form.email || "").trim().toLowerCase()
    const password = form.password || ""
    const errors = {}

    if (!name) {
        errors.name = "Name is required"
    }

    if (!email) {
        errors.email = "Email is required"
    } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = "Enter a valid email address"
    }

    if (!password) {
        errors.password = "Password is required"
    } else if (password.length < MIN_PASSWORD_LENGTH) {
        errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    }

    if (password !== form.confirmPassword) {
        errors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(errors).length > 0) {
        return { errors }
    }

    const members = await loadMembers()
    const emailTaken = members.some(
        (member) => String(member.email).toLowerCase() === email,
    )

    if (emailTaken) {
        return {
            errors: { email: "An account with this email already exists" },
            emailTaken: true,
        }
    }

    const [firstName, ...otherNames] = name.split(/\s+/)
    const nextId = members.reduce((highest, member) => Math.max(highest, member.id), 0) + 1

    return {
        user: {
            id: nextId,
            firstName,
            lastName: otherNames.join(" "),
            email,
            householdId: null,
        },
    }
}

module.exports = {
    loginUser,
    registerUser,
}
