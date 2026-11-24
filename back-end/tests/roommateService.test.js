const { expect } = require("chai")
const { removeRoommate } = require("../services/roommateService")

describe("roommateService.removeRoommate", () => {
  // household 1 has Ana (1) and Ben (2); Cleo (3) lives in household 2
  const loadMembers = async () => [
    { id: 1, first_name: "Ana", last_name: "Lopez", email: "ana@example.com", password: "secret123", household_id: 1 },
    { id: 2, first_name: "Ben", last_name: "Park", email: "ben@example.com", password: "secret456", household_id: 1 },
    { id: 3, first_name: "Cleo", last_name: "Diaz", email: "cleo@example.com", password: "secret789", household_id: 2 },
  ]
  const settled = async () => ({})

  it("removes a roommate who is in the household and has no balance", async () => {
    const result = await removeRoommate({ householdId: 1, memberId: 2, requesterId: 1 }, loadMembers, settled)

    expect(result.error).to.equal(undefined)
    expect(result.removed).to.deep.equal({ id: 2, firstName: "Ben", lastName: "Park", householdId: 1 })
  })

  it("accepts ids sent as strings, like the ones in the URL", async () => {
    const result = await removeRoommate({ householdId: "1", memberId: "2", requesterId: "1" }, loadMembers, settled)

    expect(result.removed.id).to.equal(2)
  })

  it("never returns the removed roommate's password or email", async () => {
    const result = await removeRoommate({ householdId: 1, memberId: 2, requesterId: 1 }, loadMembers, settled)

    expect(result.removed).to.not.have.property("password")
    expect(result.removed).to.not.have.property("email")
  })

  it("returns 403 when the person removing is not in the household", async () => {
    const result = await removeRoommate({ householdId: 1, memberId: 2, requesterId: 3 }, loadMembers, settled)

    expect(result.status).to.equal(403)
    expect(result.error).to.equal("Only members of this household can remove roommates")
  })

  it("returns 404 when the roommate is not in the household", async () => {
    const result = await removeRoommate({ householdId: 1, memberId: 3, requesterId: 1 }, loadMembers, settled)

    expect(result.status).to.equal(404)
    expect(result.error).to.equal("This person is not a member of the household")
  })

  it("returns 404 when the roommate does not exist at all", async () => {
    const result = await removeRoommate({ householdId: 1, memberId: 99, requesterId: 1 }, loadMembers, settled)

    expect(result.status).to.equal(404)
  })

  it("returns 409 when the roommate still has an outstanding balance", async () => {
    const owesMoney = async () => ({ 2: 42.5 })
    const result = await removeRoommate({ householdId: 1, memberId: 2, requesterId: 1 }, loadMembers, owesMoney)

    expect(result.status).to.equal(409)
    expect(result.error).to.equal("Ben still has an outstanding balance of $42.50. Settle it before removing them.")
  })

  it("also blocks the removal when the household owes the roommate money", async () => {
    const isOwed = async () => ({ 2: -10 })
    const result = await removeRoommate({ householdId: 1, memberId: 2, requesterId: 1 }, loadMembers, isOwed)

    expect(result.status).to.equal(409)
  })

  it("returns 400 when someone tries to remove themselves", async () => {
    const result = await removeRoommate({ householdId: 1, memberId: 1, requesterId: 1 }, loadMembers, settled)

    expect(result.status).to.equal(400)
    expect(result.error).to.equal("You cannot remove yourself from the household")
  })

  it("returns 400 without loading members when an id is not a number", async () => {
    let loaded = false
    const trackLoad = async () => {
      loaded = true
      return []
    }
    const result = await removeRoommate({ householdId: "abc", memberId: 2, requesterId: 1 }, trackLoad, settled)

    expect(result.status).to.equal(400)
    expect(loaded).to.equal(false)
  })

  it("returns 400 when the requester id is missing", async () => {
    const result = await removeRoommate({ householdId: 1, memberId: 2 }, loadMembers, settled)

    expect(result.status).to.equal(400)
  })
})
