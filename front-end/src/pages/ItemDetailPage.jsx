import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, PageHeader } from '../components'
import { deleteWear, getItem, getWears, logWear } from '../services/closetService'
import { formatMoney, withWearStats } from '../utils/itemStats'

export default function ItemDetailPage() {
  const { itemId } = useParams()
  return <ItemDetails key={itemId} itemId={itemId} />
}

function ItemDetails({ itemId }) {
  const [item, setItem] = useState(null)
  const [wears, setWears] = useState([])
  const [error, setError] = useState('')

  const [wearToDelete, setWearToDelete] = useState(null)
  const [actionError, setActionError] = useState('')

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

  async function reloadWears() {
    const history = await getWears(itemId)
    setWears(history)
    setItem(withWearStats([item], history)[0])
  }


  async function wearToday() {
    setActionError('')

    const now = new Date()
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-')

    try {
      await logWear(itemId, date)
      await reloadWears()
    } catch {
      setActionError('Could not log a wear. Please try again.')
    }
  }


  async function removeWear() {
    setActionError('')

    try {
      await deleteWear(wearToDelete.id)
      setWearToDelete(null)
      await reloadWears()
    } catch {
      setWearToDelete(null)
      setActionError('Could not remove that wear. Please try again.')
    }
  }

  return (
    <main className="pb-8">
      <PageHeader title="Item detail" backTo="/closet" />
      {error ? <p role="alert" className="px-4 text-sm text-red-600">{error}</p> : !item ? (
        <p role="status" className="px-4 text-sm text-stone-500">Loading item…</p>
      ) : (
        <div className="space-y-5 px-4">
          <div className="flex justify-end">
            <Link to={`/closet/${itemId}/edit`} className="text-sm font-semibold">
              Edit
            </Link>
          </div>
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

          <div className="space-y-2">
            <Button fullWidth onClick={wearToday}>
              Wear it today
            </Button>
            <Link to={`/closet/${itemId}/bulk-log`} className="flex min-h-11 items-center justify-center rounded-xl bg-stone-100 px-4 text-sm font-semibold text-stone-900 ring-1 ring-stone-300">
              Bulk-log past wears
            </Link>
            {actionError && <p role="alert" className="text-sm text-red-600">{actionError}</p>}
          </div>

          <section aria-labelledby="wear-history">
            <h2 id="wear-history" className="font-semibold">Wear history</h2>
            {wears.length === 0 ? <p className="mt-2 text-sm text-stone-500">No wears yet.</p> : (
              <ul className="mt-2">
                {wears.map((wear) => (
                  <li key={wear.id} className="flex justify-between gap-3 py-3 text-sm">
                    <time dateTime={wear.date}>{wear.date}</time>
                    <div className="flex items-center gap-3">
                      <span className="text-right text-stone-600">
                        {wear.type === 'estimate' ? `${wear.count} wears (estimate) · ${wear.period === 'all-time' ? 'All time' : wear.period === 'this-year' ? 'This year' : 'Last year'}` : 'Logged'}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove wear from ${wear.date}`}
                        onClick={() => setWearToDelete(wear)}
                        className="px-1 text-stone-500 hover:text-stone-900"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {wearToDelete && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-xs rounded-xl bg-white p-4">
            <p className="font-semibold">Remove this wear?</p>
            <p className="mt-1 text-sm text-stone-600">
              {wearToDelete.type === 'estimate'
                ? `This will remove all ${wearToDelete.count} estimated wears.`
                : `This will remove the wear logged on ${wearToDelete.date}.`}
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setWearToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" fullWidth onClick={removeWear}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}