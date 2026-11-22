const chai = require("chai")
const expect = chai.expect
const { getHouseholdActivity } = require("../services/activityService")

describe("getHouseholdActivity", () => {
  const now = new Date(2026, 10, 17)

  it("returns only current-month bills in currentMonthBills", async () => {
    const loadData = async () => ({
      members: [
        { id: 1, household_id: 1 },
        { id: 2, household_id: 1 },
      ],
      activity: [
        {
          id: 1,
          household_id: 1,
          date: "2026-11-10",
          type: "bill",
          paid_by: 1,
        },
        {
          id: 2,
          household_id: 1,
          date: "2026-10-10",
          type: "bill",
          paid_by: 1,
        },
        {
          id: 3,
          household_id: 1,
          date: "2026-11-12",
          type: "expense",
          paid_by: 2,
        },
      ],
    })

    const result = await getHouseholdActivity(1, now, loadData)

    expect(result.currentMonthBills).to.have.lengthOf(1)
    expect(result.currentMonthBills[0].id).to.equal(1)
  })

  it("returns all valid activity in the household history", async () => {
  const loadData = async () => ({
    members: [
      { id: 1, household_id: 1 },
      { id: 2, household_id: 1 },
      { id: 3, household_id: 2 },
    ],
    activity: [
      {
        id: 1,
        household_id: 1,
        date: "2026-11-10",
        type: "bill",
        paid_by: 1,
      },
      {
        id: 2,
        household_id: 1,
        date: "2026-10-15",
        type: "expense",
        paid_by: 2,
      },
      {
        id: 3,
        household_id: 2,
        date: "2026-11-12",
        type: "bill",
        paid_by: 3,
      },
      {
        id: 4,
        household_id: 1,
        date: "2026-11-14",
        type: "payment",
        paid_by: 99,
      },
    ],
  })

  const now = new Date(2026, 10, 17)
  const result = await getHouseholdActivity(1, now, loadData)

  expect(result.activity.map((entry) => entry.id)).to.deep.equal([1, 2])
})

  it("returns empty arrays when the household has no matching data", async () => {
    const loadData = async () => ({
      members: [],
      activity: [],
    })

    const result = await getHouseholdActivity(99, now, loadData)

    expect(result.members).to.deep.equal([])
    expect(result.activity).to.deep.equal([])
    expect(result.currentMonthBills).to.deep.equal([])
  })
})