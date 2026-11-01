// Wear and cost-per-wear math shared by the dashboard screens.
// Estimated wears count toward an item's total the same as logged wears.

export function totalWearsByItem(wears) {
  const totals = {}
  wears.forEach((wear) => {
    const amount = wear.type === 'estimate' ? wear.count : 1
    totals[wear.itemId] = (totals[wear.itemId] ?? 0) + amount
  })
  return totals
}

// Returns null when there are no wears, so callers can show "No wears yet".
export function costPerWear(price, wearCount) {
  return wearCount > 0 ? price / wearCount : null
}

export function withWearStats(items, wears) {
  const totals = totalWearsByItem(wears)
  return items.map((item) => {
    const wearCount = totals[item.id] ?? 0
    return { ...item, wearCount, costPerWear: costPerWear(item.price, wearCount) }
  })
}

const moneyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatMoney(amount) {
  return moneyFormatter.format(amount)
}
