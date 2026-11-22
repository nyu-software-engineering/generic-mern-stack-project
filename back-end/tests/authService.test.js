const chai = require("chai")
const expect = chai.expect
const { loginUser } = require("../services/authService")

describe("loginUser", () => {
    // fake members list so the tests never call Mockaroo
    const members = [
        {
            id: 1,
            first_name: "Demo",
            last_name: "User",
            email: "demo@splitlease.com",
            password: "password123",
            household_id: 1,
        },
        {
            id: 2,
            first_name: "Maya",
            last_name: "Lee",
            email: "maya@example.com",
            password: "secret456",
            household_id: 2,
        },
    ]
    const loadMembers = async () => members

    it("returns the member when the email and password match", async () => {
        const user = await loginUser("demo@splitlease.com", "password123", loadMembers)

        expect(user).to.deep.equal({
            id: 1,
            firstName: "Demo",
            lastName: "User",
            email: "demo@splitlease.com",
            householdId: 1,
        })
    })

    it("ignores capital letters and extra spaces in the email", async () => {
        const user = await loginUser("  Demo@SplitLease.com ", "password123", loadMembers)

        expect(user).to.have.property("id", 1)
    })

    it("never returns the password", async () => {
        const user = await loginUser("maya@example.com", "secret456", loadMembers)

        expect(user).to.not.have.property("password")
    })

    it("returns null when the password is wrong", async () => {
        const user = await loginUser("demo@splitlease.com", "wrong-password", loadMembers)

        expect(user).to.equal(null)
    })

    it("returns null when the email does not belong to any member", async () => {
        const user = await loginUser("nobody@example.com", "password123", loadMembers)

        expect(user).to.equal(null)
    })
})
