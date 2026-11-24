import axios from 'axios'
import { getCurrentUser } from '../login/authApi'

export const getMonthlyActivity = async () => {
  const user = getCurrentUser()

  if (!user?.householdId) {
    return {
      members: [],
      activity: [],
    }
  }

  const response = await axios.get(
    `/api/households/${user.householdId}/activity`,
  )

  const members = response.data.members.map((member) => ({
    id: member.id,
    name: `${member.first_name} ${member.last_name}`,
    avatar: `https://picsum.photos/seed/splitlease-${member.id}/96`,
  }))

  const activity = response.data.activity.map((entry) => {
    const [year, month, day] = entry.date.split("-").map(Number)

    return {
      id: entry.id,
      year,
      month: month - 1,
      day,
      type: entry.type,
      name: entry.name,
      amount: entry.amount,
      paidBy: entry.paid_by,
    }
  })

  return {
    members,
    activity,
  }
}