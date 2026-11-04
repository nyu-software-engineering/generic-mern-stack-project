// Shared money and percent formatting helpers.

export function formatMoney(amount) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function formatSignedMoney(amount) {
  const sign = amount >= 0 ? '+' : '-'
  return sign + formatMoney(Math.abs(amount))
}

export function formatSignedPercent(percent) {
  const sign = percent >= 0 ? '+' : '-'
  return `${sign}${Math.abs(percent).toFixed(2)}%`
}
