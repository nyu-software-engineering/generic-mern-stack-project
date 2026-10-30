import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState, PageHeader, Tabs } from '../components'
import { getItems, getWears } from '../services/closetService'
import { formatMoney, withWearStats } from '../utils/itemStats'

const SORT_OPTIONS = [
  { value: 'cost-per-wear', label: 'Cost / wear' },
  { value: 'most-worn', label: 'Most worn' },
  { value: 'least-worn', label: 'Least worn' },
]

// Lowest cost-per-wear first. Items with no wears have no cost-per-wear, so they go last.
function byCostPerWear(a, b) {
  if (a.costPerWear === null) return b.costPerWear === null ? 0 : 1
  if (b.costPerWear === null) return -1
  return a.costPerWear - b.costPerWear
}

const SORTERS = {
  'cost-per-wear': byCostPerWear,
  'most-worn': (a, b) => b.wearCount - a.wearCount,
  'least-worn': (a, b) => a.wearCount - b.wearCount,
}

function formatWears(count) {
  return `${count} ${count === 1 ? 'wear' : 'wears'}`
}

export default function ItemRankingsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState(null)
  const [sort, setSort] = useState('cost-per-wear')

  useEffect(() => {
    Promise.all([getItems(), getWears()]).then(([itemList, wearList]) => {
      setItems(withWearStats(itemList, wearList))
    })
  }, [])

  const ranked = useMemo(() => (items ? [...items].sort(SORTERS[sort]) : []), [items, sort])

  return (
    <div className="pb-8">
      <PageHeader title="Item rankings" backTo="/dashboard" />

      <Tabs label="Rank items by" options={SORT_OPTIONS} value={sort} onChange={setSort} className="px-4" />

      {items === null && <p className="px-4 py-8 text-sm text-stone-500">Loading…</p>}

      {items?.length === 0 && (
        <EmptyState title="No items yet" description="Add clothes to your closet to see how they rank." />
      )}

      {ranked.length > 0 && (
        <ol className="mt-3 divide-y divide-stone-200 px-4">
          {ranked.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => navigate(`/closet/${item.id}`)}
                className="flex w-full items-center gap-3 py-3 text-left hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-stone-900"
              >
                <span className="w-6 shrink-0 text-sm font-semibold text-stone-400 tabular-nums">{index + 1}</span>
                <img
                  src={item.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 shrink-0 rounded-lg bg-stone-200 object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-stone-900">{item.name}</span>
                  <span className="block text-xs text-stone-500">
                    {item.category} · {sort === 'cost-per-wear' ? formatWears(item.wearCount) : formatMoney(item.price)}
                  </span>
                </span>
                <span className="shrink-0 text-right text-sm font-semibold text-stone-900 tabular-nums">
                  {sort === 'cost-per-wear'
                    ? item.costPerWear === null
                      ? <span className="font-normal text-stone-500">No wears yet</span>
                      : `${formatMoney(item.costPerWear)}/wear`
                    : formatWears(item.wearCount)}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
