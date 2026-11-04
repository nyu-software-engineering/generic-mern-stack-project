// Negotiation outcomes are kept in this browser so the renter can come back and update them,
// the same way share links are in api.js. In Sprint 2 this moves to the back-end.
const outcomesStorageKey = 'leverage-negotiation-outcomes'

function getAllOutcomes() {
  const saved = window.localStorage.getItem(outcomesStorageKey)
  return saved ? JSON.parse(saved) : {}
}

export function getOutcome(checkId) {
  return getAllOutcomes()[checkId] ?? null
}

export function saveOutcome(checkId, outcome) {
  const outcomes = getAllOutcomes()
  outcomes[checkId] = { ...outcome, updatedAt: new Date().toISOString() }
  window.localStorage.setItem(outcomesStorageKey, JSON.stringify(outcomes))
  return outcomes[checkId]
}