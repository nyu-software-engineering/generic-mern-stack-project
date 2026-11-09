import axios from 'axios'
import { getCurrentUser } from '../login/authApi'

// Gets the household's members and activity from the mock API (set in .env)
// and turns them into the shape the Monthly Activity page uses.
// Profile pictures come from Picsum, a random image service.
export const getMonthlyActivity = async () => {
  const [membersRes, activityRes] = await Promise.all([
    axios.get(import.meta.env.VITE_MEMBERS_API_URL),
    axios.get(import.meta.env.VITE_ACTIVITY_API_URL),
  ])

  // only show the logged-in user's household; show everything if nobody has logged in
  const user = getCurrentUser()
  const householdId = user ? user.householdId : null
  const inHousehold = item => householdId === null || item.household_id === householdId

  const members = membersRes.data.filter(inHousehold).map(m => ({
    id: m.id,
    name: `${m.first_name} ${m.last_name}`,
    avatar: `https://picsum.photos/seed/splitlease-${m.id}/96`,
  }))
  const memberIds = members.map(m => m.id)

  const activity = activityRes.data
    .filter(a => inHousehold(a) && memberIds.includes(a.paid_by))
    .map(a => {
      const [year, month, day] = a.date.split('-').map(Number)
      return {
        id: a.id,
        year,
        month: month - 1, // the page counts months from 0 (Jan) to 11 (Dec)
        day,
        type: a.type,
        name: a.name,
        amount: a.amount,
        paidBy: a.paid_by,
      }
    })

  return { members, activity }
}
