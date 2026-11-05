import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Input, PageHeader } from '../components'
import { getItem, getWears } from '../services/closetService'
import { costPerWear, formatMoney, withWearStats } from '../utils/itemStats'

export default function BulkLogPage() {
  const { itemId } = useParams()
  return <BulkLogForm key={itemId} itemId={itemId} />
}

function BulkLogForm({ itemId }) {
  const [item, setItem] = useState(null)
  const [estimate, setEstimate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getItem(itemId), getWears(itemId)])
      .then(([details, wears]) => {
        if (!cancelled) setItem(withWearStats([details], wears)[0])
      })
      .catch(() => {
        if (!cancelled) setError('This item could not be loaded. Return to your closet and try again.')
      })
    return () => { cancelled = true }
  }, [itemId])

  const count = Number(estimate)
  const valid = /^[0-9]+$/.test(estimate) && Number.isSafeInteger(count) && count > 0
    && Number.isSafeInteger((item?.wearCount ?? 0) + count)
  const inputError = estimate !== '' && !valid ? 'Enter a positive whole number.' : ''
  const preview = item ? costPerWear(item.price, item.wearCount + (valid ? count : 0)) : null
  const displayCost = (value) => value === null ? 'No wears yet' : formatMoney(value)

  return (
    <main className="pb-10">
      <PageHeader title="Bulk-log wears" backTo={error ? '/closet' : `/closet/${itemId}`} />
      {error ? (
        <p role="alert" className="px-4 text-sm text-red-600">{error}</p>
      ) : !item ? (
        <p role="status" className="px-4 py-8 text-sm text-stone-500">Loading item…</p>
      ) : (
        <div className="space-y-6 px-4">
          <div className="flex items-center gap-4">
            <img src={item.imageUrl} alt="" className="size-16 rounded-xl bg-stone-100 object-cover ring-1 ring-stone-200" />
            <div className="min-w-0">
              <h2 className="break-words font-semibold">{item.name}</h2>
              <p className="mt-1 text-sm text-stone-500">
                {formatMoney(item.price)} · {item.wearCount} total {item.wearCount === 1 ? 'wear' : 'wears'}
              </p>
            </div>
          </div>

          <p className="text-sm leading-6 text-stone-600">
            Owned this before you started using Worn? Estimate how many times you've worn it.
          </p>

          <Input
            label="Estimated wears"
            type="text"
            inputMode="numeric"
            placeholder="# times"
            value={estimate}
            onChange={(event) => setEstimate(event.target.value)}
            error={inputError}
          />

          <section aria-labelledby="preview-title" className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <h2 id="preview-title" className="font-semibold">New cost-per-wear</h2>
            <p aria-live="polite" aria-atomic="true" className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-semibold tabular-nums">
              <span><span className="sr-only">Current: </span>{displayCost(item.costPerWear)}</span>
              <span aria-hidden="true">→</span>
              <span><span className="sr-only">Preview: </span>{displayCost(preview)}</span>
            </p>
            <p className="mt-2 text-sm text-stone-500">Estimates are labeled separately from exact logs.</p>
          </section>

          <div className="space-y-2">
            <Button fullWidth disabled aria-describedby="save-note">Save estimate</Button>
            <p id="save-note" className="text-center text-xs text-stone-500">
              Preview only — saving estimates is coming next.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
