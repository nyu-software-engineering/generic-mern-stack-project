import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components'
import { getItem, getWears } from '../services/closetService'
import { formatMoney, withWearStats } from '../utils/itemStats'

export default function ItemDetailPage() {
  const { itemId } = useParams()
  return <ItemDetails key={itemId} itemId={itemId} />
}

function ItemDetails({ itemId }) {
  const [item, setItem] = useState(null)
  const [wears, setWears] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getItem(itemId), getWears(itemId)])
      .then(([details, history]) => {
        if (cancelled) return
        setItem(withWearStats([details], history)[0])
        setWears(history)
      })
      .catch(() => {
        if (!cancelled) setError('This item could not be loaded. Return to your closet and try again.')
      })
    return () => { cancelled = true }
  }, [itemId])

  return (
    <main className="pb-8">
      <PageHeader title="Item detail" backTo="/closet" />
      {error ? <p role="alert" className="px-4 text-sm text-red-600">{error}</p> : !item ? (
        <p role="status" className="px-4 text-sm text-stone-500">Loading item…</p>
      ) : (
        <div className="space-y-5 px-4">
          <img src={item.imageUrl} alt={item.name} className="aspect-[4/3] w-full rounded-xl bg-stone-100 object-cover" />
          <div>
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="mt-1 text-sm text-stone-500">{item.category}{item.purchaseDate ? ` · ${item.purchaseDate}` : ''}</p>
          </div>
          <dl className="grid grid-cols-3 gap-2">
            {[
              ['Cost / wear', item.costPerWear === null ? 'No wears yet' : formatMoney(item.costPerWear)],
              ['Total wears', item.wearCount],
              ['Price', formatMoney(item.price)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <dt className="text-xs text-stone-500">{label}</dt>
                <dd className="mt-1 break-words text-lg font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <Link to={`/closet/${itemId}/bulk-log`} className="flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">
            Bulk-log past wears
          </Link>
          <section aria-labelledby="wear-history">
            <h2 id="wear-history" className="font-semibold">Wear history</h2>
            {wears.length === 0 ? <p className="mt-2 text-sm text-stone-500">No wears yet.</p> : (
              <ul className="mt-2 divide-y divide-stone-200">
                {wears.map((wear) => (
                  <li key={wear.id} className="flex justify-between gap-3 py-3 text-sm">
                    <time dateTime={wear.date}>{wear.date}</time>
                    <span className="text-right text-stone-600">
                      {wear.type === 'estimate' ? `${wear.count} wears (estimate) · ${wear.period === 'all-time' ? 'All time' : wear.period === 'this-year' ? 'This year' : 'Last year'}` : 'Logged'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
