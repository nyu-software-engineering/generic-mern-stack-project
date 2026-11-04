import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components'
import { getItems, getWears } from '../services/closetService'
import { formatMoney, withWearStats } from '../utils/itemStats'

export default function ClosetPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    Promise.all([getItems(), getWears()])
      .then(([itemList, wearList]) => {
        if (!cancelled) setItems(withWearStats(itemList, wearList))
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load your closet. Please refresh to try again.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const wornItems = (items ?? []).filter((item) => item.costPerWear !== null)
  const average = wornItems.length
    ? wornItems.reduce((sum, item) => sum + item.costPerWear, 0) / wornItems.length
    : null

  return (
    <main className="px-4 pt-10 pb-8">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">My Closet</h1>
          <Link
            to="/closet/new"
            aria-label="Add item"
            className="flex h-10 w-10 items-center justify-center bg-stone-900 text-xl font-semibold text-white hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            <span aria-hidden="true">+</span>
          </Link>
        </div>

        {items !== null && (
          <p className="mt-3 text-xs text-stone-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
            {' · '}
            {average === null ? 'No wears yet' : `avg ${formatMoney(average)} / wear`}
          </p>
        )}
      </header>

      {error ? (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      ) : items === null ? (
        <p role="status" className="py-8 text-sm text-stone-500">Loading your closet…</p>
      ) : items.length === 0 ? (
        <EmptyState title="Your closet is empty" description="Use the + button to add your first item." />
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <li key={item.id} className="min-w-0">
              <Link
                to={`/closet/${item.id}`}
                className="block h-full rounded-lg border border-stone-200 bg-white p-2 hover:border-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              >
                <img
                  src={item.imageUrl}
                  alt=""
                  loading="lazy"
                  className="aspect-[5/4] w-full bg-stone-100 object-cover"
                />
                <h2 className="mt-2 truncate text-sm" title={item.name}>{item.name}</h2>
                <p className="mt-1 text-xs">
                  {item.costPerWear === null ? 'No wears yet' : `${formatMoney(item.costPerWear)} / wear`}
                </p>
                <p className="mt-2 text-xs text-stone-600">
                  {item.wearCount} {item.wearCount === 1 ? 'wear' : 'wears'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
