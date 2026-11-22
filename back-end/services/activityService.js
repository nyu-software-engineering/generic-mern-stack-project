const axios = require("axios")

const loadMockarooData = async () => {
    const [membersResponse, activityResponse] = await Promise.all([
        axios.get(process.env.MOCKAROO_MEMBERS_API_URL),
        axios.get(process.env.MOCKAROO_ACTIVITY_API_URL),
    ])

    return {
        members: membersResponse.data,
        activity: activityResponse.data,
    }
}

const getHouseholdActivity = async (
    householdId,
    now = new Date(),
    loadData = loadMockarooData,
) => {
    const {members: allMembers, activity: allActivity} = await loadData()

    const members = allMembers.filter(
        (member) => member.household_id === householdId,
    )

    const memberIds = members.map((member) => member.id)

    const activity = allActivity.filter(
        (entry) => entry.household_id === householdId && memberIds.includes(entry.paid_by),
    )

    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const currentMonthBills = activity.filter((entry) => {
        const [year, month] = entry.date.split("-").map(Number)

        return (
            entry.type === "bill" &&
            year === currentYear &&
            month - 1 === currentMonth
        )
    })

    return {
        members,
        activity,
        currentMonthBills,
    }
}

module.exports = {
    getHouseholdActivity,
}