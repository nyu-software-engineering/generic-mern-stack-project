// Shared formatting so every screen shows dates and money the same way.
export function formatDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRent(amount) {
  return `$${amount.toLocaleString('en-US')}`
}
