const { expect } = require("chai")
const { createHousehold, makeInviteCode } = require("../services/householdService")

describe("householdService.createHousehold", () => {
  // fixed code so the tests know exactly what to expect
  const fakeCode = () => "ABC123"

  it("should create a household with the given name and an invite code", () => {
    const result = createHousehold({ name: "Maple St Apartment", ownerId: 1 }, fakeCode)

    expect(result.errors).to.equal(undefined)
    expect(result.household.household_name).to.equal("Maple St Apartment")
    expect(result.household.invite_code).to.equal("ABC123")
    expect(result.household.owner_id).to.equal(1)
    expect(result.household.household_id).to.be.a("number")
  })

  it("should return an invite link to the Join Household page", () => {
    const result = createHousehold({ name: "Maple St Apartment" }, fakeCode)

    expect(result.inviteLink).to.equal("/join-household?code=ABC123")
  })

  it("should trim spaces around the household name", () => {
    const result = createHousehold({ name: "   Loft 4B   " }, fakeCode)

    expect(result.household.household_name).to.equal("Loft 4B")
  })

  it("should give each new household a different id", () => {
    const first = createHousehold({ name: "First" }, fakeCode)
    const second = createHousehold({ name: "Second" }, fakeCode)

    expect(second.household.household_id).to.not.equal(first.household.household_id)
  })

  it("should return an error when the name is missing", () => {
    const result = createHousehold({}, fakeCode)

    expect(result.household).to.equal(undefined)
    expect(result.errors.name).to.equal("Household name is required")
  })

  it("should return an error when the name is only spaces", () => {
    const result = createHousehold({ name: "    " }, fakeCode)

    expect(result.errors.name).to.equal("Household name is required")
  })

  it("should return an error when the name is longer than 50 characters", () => {
    const result = createHousehold({ name: "a".repeat(51) }, fakeCode)

    expect(result.errors.name).to.equal("Household name must be 50 characters or less")
  })

  it("should set owner_id to null when no owner is given", () => {
    const result = createHousehold({ name: "No Owner House" }, fakeCode)

    expect(result.household.owner_id).to.equal(null)
  })
})

describe("householdService.makeInviteCode", () => {
  it("should make a 6 character code of capital letters and numbers", () => {
    const code = makeInviteCode()

    expect(code).to.match(/^[0-9A-F]{6}$/)
  })
})
