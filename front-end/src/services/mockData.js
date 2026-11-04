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

// Sample lessons for the Learning Hub. Later these will come from the back end.
export const lessons = [
  {
    id: 'first-steps',
    title: 'First steps',
    description: 'What StockSim is and how virtual cash works.',
    duration: '2 min',
    content:
      'StockSim lets you practice investing with fake money. You start with virtual cash, pick stocks, and see how your choices affect your portfolio. Nothing here uses real money, so you can learn without risk.',
  },
  {
    id: 'stock-prices',
    title: 'Understanding stock prices',
    description: 'Learn what a share price means and why it changes.',
    duration: '3 min',
    content:
      'A stock price is what one share of a company costs right now. Prices go up when more people want to buy, and down when more people want to sell. Checking the latest price helps you decide when to buy or sell in StockSim.',
  },
  {
    id: 'balanced-portfolio',
    title: 'Building a balanced portfolio',
    description: 'Why spreading your money across investments can help.',
    duration: '4 min',
    content:
      'A portfolio is the collection of investments you own. Putting all your money into one stock is risky. Spreading money across a few companies or ETFs can reduce the chance that one bad day hurts everything at once.',
  },
  {
    id: 'reading-returns',
    title: 'Reading your returns',
    description: 'How to tell if your practice trades are gaining or losing.',
    duration: '3 min',
    content:
      'A return shows how much your investment has gained or lost compared with what you paid. A positive return means you are ahead. A negative return means the value has dropped. StockSim shows this so you can learn from each trade.',
  },
  {
    id: 'market-orders',
    title: 'Market orders',
    description: 'What happens when you buy or sell at the current price.',
    duration: '3 min',
    content:
      'A market order means you want to buy or sell right away at the best available price. In StockSim, this is the simple way to practice a trade. The price can change quickly, so the final amount may be a little different from what you first saw.',
  },
  {
    id: 'dividends',
    title: 'What is a dividend?',
    description: 'How some companies share profits with shareholders.',
    duration: '2 min',
    content:
      'A dividend is money a company pays to people who own its shares. Not every company pays dividends. When one does, shareholders receive a small payment based on how many shares they own.',
  },
]
