// Mock wear records. Two kinds:
//   logged:   one exact wear on a date
//   estimate: a rough count of past wears for a period, entered by the user
// Logged wears are generated relative to today so the data always looks recent.

// How many wears each item has logged in the last 120 days.
const LOGGED_WEAR_COUNTS = {
  'item-1': 22,
  'item-2': 14,
  'item-3': 9,
  'item-4': 4,
  'item-5': 31,
  'item-6': 12,
  'item-7': 3,
  'item-8': 38,
  'item-9': 10,
  'item-10': 18,
  'item-11': 6,
  'item-12': 2,
  // item-13 has never been worn
}

const ESTIMATES = [
  { itemId: 'item-5', period: 'last-year', count: 60 },
  { itemId: 'item-11', period: 'last-year', count: 25 },
  { itemId: 'item-2', period: 'all-time', count: 15 },
]

// Small seeded random generator so the mock data is the same on every load.
function seededRandom(seed) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function buildMockWears() {
  const random = seededRandom(42)
  const wears = []

  Object.entries(LOGGED_WEAR_COUNTS).forEach(([itemId, count]) => {
    for (let i = 0; i < count; i += 1) {
      wears.push({
        id: `wear-${wears.length + 1}`,
        itemId,
        type: 'logged',
        date: daysAgo(Math.floor(random() * 120)),
      })
    }
  })

  ESTIMATES.forEach((estimate) => {
    wears.push({
      id: `wear-${wears.length + 1}`,
      type: 'estimate',
      date: daysAgo(30),
      ...estimate,
    })
  })

  return wears
}

export const mockWears = buildMockWears()
