import { useState } from 'react'
import { Link } from 'react-router'
import BackLink from '../../components/ui/BackLink.jsx'
import { formatMoney } from '../../components/ui/format.js'
import { holdings, transactions } from '../../services/mockData.js'

const tradeTypes = ['All', 'Buy', 'Sell']
const dateRanges = [
  { id: '1M', label: '1M' },
  { id: '3M', label: '3M' },
  { id: 'ALL', label: 'ALL' },
]

function nameOf(symbol) {
  return holdings.find((h) => h.symbol === symbol)?.name ?? symbol
}

function withinRange(date, range) {
  if (range === 'ALL') return true
  const days = range === '1M' ? 30 : 90
  const cutoff = new Date('2026-11-03')
  cutoff.setDate(cutoff.getDate() - days)
  return new Date(date) >= cutoff
}

function TransactionsPage() {
  const [tradeType, setTradeType] = useState('All')
  const [range, setRange] = useState('ALL')

  const visible = transactions.filter(
    (t) => (tradeType === 'All' || t.type === tradeType.toLowerCase()) && withinRange(t.date, range),
  )

  return (
    <>
      <BackLink />
      <h1 tabIndex={-1} className="text-4xl font-semibold tracking-[-0.04em]">Transactions</h1>

      <section aria-label="Filters" className="mt-6 rounded-2xl border border-border p-5">
        <p className="text-sm font-[650] tracking-[0.08em] text-muted uppercase">Trade type</p>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-border p-1">
          {tradeTypes.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={tradeType === type}
              onClick={() => setTradeType(type)}
              className={`min-h-11 cursor-pointer rounded-lg font-[650] ${
                tradeType === type ? 'bg-selected text-selected-ink' : 'text-muted hover:bg-hover hover:text-ink'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm font-[650] tracking-[0.08em] text-muted uppercase">Date range</p>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-border p-1">
          {dateRanges.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={range === option.id}
              onClick={() => setRange(option.id)}
              className={`min-h-11 cursor-pointer rounded-lg font-[650] ${
                range === option.id ? 'bg-selected text-selected-ink' : 'text-muted hover:bg-hover hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setTradeType('All')
            setRange('ALL')
          }}
          className="mt-4 min-h-12 w-full cursor-pointer rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink hover:bg-hover"
        >
          Clear filters
        </button>
      </section>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border p-6">
          <p className="font-[650]">No matching transactions</p>
          <p className="mt-1 text-muted">Try a wider date range or a different trade type.</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {visible.map((t) => (
            <li key={t.id}>
              <Link
                to={`/portfolio/transactions/${t.id}`}
                className="block rounded-2xl border border-border p-5 text-ink no-underline hover:bg-hover"
              >
                <p className="font-[650]">
                  {t.type === 'buy' ? 'Bought' : 'Sold'} {t.symbol} <span className="text-muted">| {nameOf(t.symbol)}</span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  {t.executedAt} · {t.shares} shares · {formatMoney(t.shares * t.price)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default TransactionsPage
