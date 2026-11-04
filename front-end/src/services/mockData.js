// Temporary mock data that stands in for the back-end API.
// Once the Express.js back-end exists (Sprint 2), these values come from it instead.

export const user = {
  displayName: 'Jordan Avery',
  email: 'jordan@example.com',
  memberSince: 'October 2026',
  // Placeholder profile photo; real avatars will come from user uploads.
  photoUrl: 'https://picsum.photos/seed/stocksim-jordan/240/240',
}

export const portfolio = {
  cash: 9250.0,
  totalValue: 10150.0,
  changeAmount: 150.0,
  changePercent: 1.5,
}

export const holdings = [
  {
    symbol: 'NOVI',
    name: 'Nova Labs',
    shares: 4,
    averagePrice: 100.0,
    latestPrice: 125.0,
  },
  {
    symbol: 'PINE',
    name: 'Pine Energy',
    shares: 5,
    averagePrice: 70.0,
    latestPrice: 80.0,
  },
]

export const transactions = [
  {
    id: 'TX-1042',
    type: 'buy',
    symbol: 'NOVI',
    shares: 4,
    price: 100.0,
    executedAt: 'Oct 01, 2026, 10:15 AM ET',
    date: '2026-10-01',
  },
  {
    id: 'TX-1043',
    type: 'buy',
    symbol: 'PINE',
    shares: 5,
    price: 70.0,
    executedAt: 'Oct 02, 2026, 11:20 AM ET',
    date: '2026-10-02',
  },
]

// Mock portfolio value series for each performance period.
export const performanceSeries = {
  '1W': [
    { label: 'Oct 28', value: 10040 },
    { label: 'Oct 29', value: 10060 },
    { label: 'Oct 30', value: 10020 },
    { label: 'Oct 31', value: 10090 },
    { label: 'Nov 02', value: 10110 },
    { label: 'Nov 03', value: 10150 },
  ],
  '1M': [
    { label: 'Oct 05', value: 10000 },
    { label: 'Oct 12', value: 10000 },
    { label: 'Oct 19', value: 10060 },
    { label: 'Oct 26', value: 10100 },
    { label: 'Nov 03', value: 10150 },
  ],
  '3M': [
    { label: 'Aug', value: 9950 },
    { label: 'Sep', value: 10020 },
    { label: 'Oct', value: 10100 },
    { label: 'Nov', value: 10150 },
  ],
  '1Y': [
    { label: 'Q1', value: 9600 },
    { label: 'Q2', value: 9800 },
    { label: 'Q3', value: 10000 },
    { label: 'Q4', value: 10150 },
  ],
  ALL: [
    { label: 'Oct 05', value: 10000 },
    { label: 'Oct 12', value: 10000 },
    { label: 'Oct 19', value: 10060 },
    { label: 'Oct 26', value: 10100 },
    { label: 'Nov 03', value: 10150 },
  ],
}

export const leaderboardAllTime = [
  { rank: 1, name: 'Casey Brooks', returnPercent: 8.2 },
  { rank: 2, name: 'Morgan Lee', returnPercent: 6.4 },
  { rank: 18, name: 'Jordan Avery', returnPercent: 1.5, isYou: true },
]

export const leaderboardThisMonth = [
  { rank: 1, name: 'Casey Brooks', returnPercent: 3.2 },
  { rank: 2, name: 'Morgan Lee', returnPercent: 2.4 },
  { rank: 12, name: 'Jordan Avery', returnPercent: 0.8, isYou: true },
]

export const badges = [
  {
    id: 'first-trade',
    name: 'First trade',
    earned: true,
    earnedDate: 'Oct 01, 2026',
    description: 'Complete your first virtual trade.',
  },
  {
    id: 'curious-learner',
    name: 'Curious learner',
    earned: false,
    description: 'Complete all 6 beginner lessons.',
    progress: { done: 3, total: 6 },
  },
]
