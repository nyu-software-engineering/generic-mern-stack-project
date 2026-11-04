import { useState } from 'react'
import BackLink from '../../components/ui/BackLink.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { formatMoney, formatSignedMoney, formatSignedPercent } from '../../components/ui/format.js'
import { holdings, performanceSeries, portfolio } from '../../services/mockData.js'

const periods = ['1W', '1M', '3M', '1Y', 'ALL']
const holdingsValue = holdings.reduce((sum, h) => sum + h.shares * h.latestPrice, 0)

function PerformancePage() {
  const [period, setPeriod] = useState('1M')
  const [inspected, setInspected] = useState(null)
  const series = performanceSeries[period]
  const values = series.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  // Scale bars between min and max so small changes stay visible.
  const heightOf = (value) => (max === min ? 60 : 15 + ((value - min) / (max - min)) * 85)

  return (
    <>
      <BackLink />
      <p className="text-sm font-[650] tracking-[0.08em] text-muted uppercase">Portfolio value</p>
      <h1 tabIndex={-1} className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
        {formatMoney(portfolio.totalValue)}
      </h1>
      <p className="mt-1 font-[650]">
        Since starting {formatSignedMoney(portfolio.changeAmount)} ({formatSignedPercent(portfolio.changePercent)})
      </p>

      <div className="mt-6 grid grid-cols-5 gap-1 rounded-xl border border-border p-1" role="tablist" aria-label="Performance period">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={period === p}
            onClick={() => setPeriod(p)}
            className={`min-h-11 cursor-pointer rounded-lg font-[650] ${
              period === p ? 'bg-selected text-selected-ink' : 'text-muted hover:bg-hover hover:text-ink'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-6 flex h-48 items-end gap-2 rounded-2xl border border-border p-4" aria-label="Portfolio value chart">
        {series.map((point) => (
          <button
            key={point.label}
            type="button"
            onClick={() => setInspected(point)}
            className="flex-1 cursor-pointer rounded-t-md bg-accent hover:bg-accent-hover"
            style={{ height: `${heightOf(point.value)}%` }}
            aria-label={`${point.label}: ${formatMoney(point.value)}`}
          />
        ))}
      </div>

      <dl className="mt-6 flex flex-col gap-3">
        <div className="flex items-baseline justify-between rounded-xl border border-border p-4">
          <dt className="text-muted">Available cash</dt>
          <dd className="font-[650]">{formatMoney(portfolio.cash)}</dd>
        </div>
        <div className="flex items-baseline justify-between rounded-xl border border-border p-4">
          <dt className="text-muted">Holdings value</dt>
          <dd className="font-[650]">{formatMoney(holdingsValue)}</dd>
        </div>
      </dl>

      {inspected && (
        <Modal title="Portfolio value" onClose={() => setInspected(null)}>
          <p>{inspected.label}, 2026 at market close.</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{formatMoney(inspected.value)}</p>
          <button
            type="button"
            onClick={() => setInspected(null)}
            className="mt-5 min-h-12 w-full cursor-pointer rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink hover:bg-accent-hover"
          >
            Close
          </button>
        </Modal>
      )}
    </>
  )
}

export default PerformancePage
