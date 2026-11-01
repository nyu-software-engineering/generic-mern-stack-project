import { useEffect, useMemo, useState } from 'react'
import { Card, EmptyState, PageHeader } from '../components'
import { getItems, getWears } from '../services/closetService'
import { costPerWear, formatMoney, withWearStats } from '../utils/itemStats'

// Groups items by category. A category's cost-per-wear is its total spend divided by its total wears.
function summarizeByCategory(items) {
  const groups = {}
  items.forEach((item) => {
    const group = groups[item.category] ?? { category: item.category, spend: 0, wearCount: 0 }
    group.spend += item.price
    group.wearCount += item.wearCount
    groups[item.category] = group
  })
  return Object.values(groups).map((group) => ({
    ...group,
    costPerWear: costPerWear(group.spend, group.wearCount),
  }))
}

// Lowest cost-per-wear first. Categories with no wears go last.
function byCostPerWear(a, b) {
  if (a.costPerWear === null) return b.costPerWear === null ? 0 : 1
  if (b.costPerWear === null) return -1
  return a.costPerWear - b.costPerWear
}

function StatCard({ value, label }) {
  return (
    <Card className="flex-1">
      <p className="text-2xl font-semibold text-stone-900 tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-stone-500">{label}</p>
    </Card>
  )
}

export default function SpendByCategoryPage() {
  const [categories, setCategories] = useState(null)

  useEffect(() => {
    Promise.all([getItems(), getWears()]).then(([itemList, wearList]) => {
      setCategories(summarizeByCategory(withWearStats(itemList, wearList)))
    })
  }, [])

  const bySpend = useMemo(() => [...(categories ?? [])].sort((a, b) => b.spend - a.spend), [categories])
  const byValue = useMemo(() => [...(categories ?? [])].sort(byCostPerWear), [categories])
  const totalSpend = bySpend.reduce((sum, c) => sum + c.spend, 0)
  const maxSpend = bySpend[0]?.spend ?? 0

  return (
    <div className="pb-8">
      <PageHeader title="Spend by category" backTo="/dashboard" />

      {categories === null && <p className="px-4 py-8 text-sm text-stone-500">Loading…</p>}

      {categories?.length === 0 && (
        <EmptyState title="No spending yet" description="Add clothes to your closet to see where your money goes." />
      )}

      {bySpend.length > 0 && (
        <div className="flex flex-col gap-6 px-4">
          <div className="flex gap-3">
            <StatCard value={formatMoney(totalSpend)} label="Total spend" />
            <StatCard value={bySpend.length} label={bySpend.length === 1 ? 'Category' : 'Categories'} />
          </div>

          <section aria-labelledby="spend-heading">
            <h2 id="spend-heading" className="mb-3 text-sm font-semibold text-stone-900">
              Total spend
            </h2>
            <ul className="flex flex-col gap-3">
              {bySpend.map((c) => (
                <li key={c.category} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3">
                  <span className="truncate text-sm text-stone-700">{c.category}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-stone-900 transition-[width] duration-500"
                      style={{ width: `${maxSpend > 0 ? (c.spend / maxSpend) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-sm font-medium text-stone-900 tabular-nums">
                    {formatMoney(c.spend)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="value-heading">
            <h2 id="value-heading" className="text-sm font-semibold text-stone-900">
              Avg cost / wear by category
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">Best value first</p>
            <ul className="mt-2 divide-y divide-stone-200">
              {byValue.map((c) => (
                <li key={c.category} className="flex items-center justify-between py-3">
                  <span className="text-sm text-stone-900">{c.category}</span>
                  <span className="text-sm font-semibold text-stone-900 tabular-nums">
                    {c.costPerWear === null ? (
                      <span className="font-normal text-stone-500">No wears yet</span>
                    ) : (
                      `${formatMoney(c.costPerWear)}/wear`
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
