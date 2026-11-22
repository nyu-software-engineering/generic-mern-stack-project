const chai = require("chai")
const expect = chai.expect
const { registerUser } = require("../services/authService")

describe("registerUser", () => {
    // fake members list so the tests never call Mockaroo
    const members = [
        { id: 1, email: "demo@splitlease.com" },
        { id: 7, email: "maya@example.com" },
    ]
    const loadMembers = async () => members

    const validForm = {
        name: "Sam Rivera",
        email: "sam@example.com",
        password: "password123",
        confirmPassword: "password123",
    }

    it("returns the new user when the form is valid", async () => {
        const result = await registerUser(validForm, loadMembers)

        expect(result.errors).to.equal(undefined)
        expect(result.user).to.deep.equal({
            id: 8,
            firstName: "Sam",
            lastName: "Rivera",
            email: "sam@example.com",
            householdId: null,
        })
    })

    it("never returns the password", async () => {
        const result = await registerUser(validForm, loadMembers)

        expect(result.user).to.not.have.property("password")
    })

    it("returns an error for every missing field", async () => {
        const result = await registerUser({}, loadMembers)

        expect(result.errors).to.include.all.keys("name", "email", "password")
    })

    it("rejects an invalid email address", async () => {
        const result = await registerUser({ ...validForm, email: "not-an-email" }, loadMembers)

        expect(result.errors).to.have.property("email", "Enter a valid email address")
    })

    it("rejects a password shorter than 8 characters", async () => {
        const result = await registerUser(
            { ...validForm, password: "short", confirmPassword: "short" },
            loadMembers,
        )

        expect(result.errors).to.have.property("password")
    })

    it("rejects passwords that do not match", async () => {
        const result = await registerUser(
            { ...validForm, confirmPassword: "different123" },
            loadMembers,
        )

        expect(result.errors).to.have.property("confirmPassword", "Passwords do not match")
    })

    it("rejects an email that is already used, ignoring capital letters", async () => {
        const result = await registerUser(
            { ...validForm, email: "Maya@Example.com" },
            loadMembers,
        )

        expect(result.emailTaken).to.equal(true)
        expect(result.errors).to.have.property("email")
    })
})
