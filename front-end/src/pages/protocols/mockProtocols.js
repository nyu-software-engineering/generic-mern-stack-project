// Temporary stand-in for the back-end protocols API until Sprint 2.
// Each call resolves with fresh copies so the page can change them freely.
const HOUSEHOLD = { id: 1, name: '42 Bleecker St Apt 5', memberCount: 4 }

const PROTOCOLS = [
  {
    id: 101,
    name: 'Quiet hours after 11pm on weeknights',
    proposedBy: 'Maya',
    status: 'pending',
    approvals: 3,
  },
  {
    id: 102,
    name: 'Split the Costco run every first Sunday',
    proposedBy: 'Jordan',
    status: 'pending',
    approvals: 1,
  },
  {
    id: 103,
    name: 'Move-out notice of 30 days before leaving',
    proposedBy: 'Sam',
    status: 'pending',
    approvals: 2,
  },
  {
    id: 104,
    name: 'Dishes washed within 24 hours',
    proposedBy: 'Demo User',
    status: 'approved',
    approvals: 4,
  },
  {
    id: 105,
    name: 'Guests staying over 3 nights chip in on utilities',
    proposedBy: 'Maya',
    status: 'approved',
    approvals: 4,
  },
]

export const getHouseholdProtocols = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        household: { ...HOUSEHOLD },
        protocols: PROTOCOLS.map(p => ({ ...p })),
      })
    }, 400)
  })
}
