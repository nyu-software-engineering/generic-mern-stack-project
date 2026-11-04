// Temporary stand-in for the back-end activity API until Sprint 2.
// Profile pictures come from Picsum, a random image service, as the Sprint 1 instructions require.
const MEMBERS = [
  { id: 1, name: 'Demo User', avatar: 'https://picsum.photos/seed/splitlease-demo/96' },
  { id: 2, name: 'Maya', avatar: 'https://picsum.photos/seed/splitlease-maya/96' },
  { id: 3, name: 'Jordan', avatar: 'https://picsum.photos/seed/splitlease-jordan/96' },
  { id: 4, name: 'Sam', avatar: 'https://picsum.photos/seed/splitlease-sam/96' },
]

// type is one of: bill (recurring), expense (one-time), purchase (shared asset), payment (settling up)
// month is 0-11, year is the calendar year
const ACTIVITY = [
  { id: 1, year: 2026, month: 8, day: 1, type: 'bill', name: 'Rent', amount: 4800, paidBy: 1 },
  { id: 2, year: 2026, month: 8, day: 3, type: 'bill', name: 'Wi-Fi', amount: 60, paidBy: 2 },
  { id: 3, year: 2026, month: 8, day: 6, type: 'purchase', name: 'Couch', amount: 640, paidBy: 3 },
  { id: 4, year: 2026, month: 8, day: 14, type: 'expense', name: 'Groceries', amount: 132, paidBy: 4 },
  { id: 5, year: 2026, month: 8, day: 20, type: 'payment', name: 'Sam paid Demo User', amount: 150, paidBy: 4 },

  { id: 6, year: 2026, month: 9, day: 1, type: 'bill', name: 'Rent', amount: 4800, paidBy: 1 },
  { id: 7, year: 2026, month: 9, day: 3, type: 'bill', name: 'Wi-Fi', amount: 60, paidBy: 2 },
  { id: 8, year: 2026, month: 9, day: 9, type: 'bill', name: 'Electricity', amount: 118, paidBy: 3 },
  { id: 9, year: 2026, month: 9, day: 12, type: 'purchase', name: 'TV', amount: 400, paidBy: 1 },
  { id: 10, year: 2026, month: 9, day: 18, type: 'expense', name: 'Groceries', amount: 96, paidBy: 2 },
  { id: 11, year: 2026, month: 9, day: 27, type: 'payment', name: 'Jordan paid Maya', amount: 80, paidBy: 3 },

  { id: 12, year: 2026, month: 10, day: 1, type: 'bill', name: 'Rent', amount: 4800, paidBy: 1 },
  { id: 13, year: 2026, month: 10, day: 2, type: 'bill', name: 'Wi-Fi', amount: 60, paidBy: 2 },
  { id: 14, year: 2026, month: 10, day: 2, type: 'expense', name: 'Cleaning supplies', amount: 42, paidBy: 4 },
  { id: 15, year: 2026, month: 10, day: 3, type: 'purchase', name: 'Router', amount: 120, paidBy: 3 },
]

export const getMonthlyActivity = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        members: MEMBERS.map(m => ({ ...m })),
        activity: ACTIVITY.map(a => ({ ...a })),
      })
    }, 400)
  })
}
