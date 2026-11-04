import { Link, useParams } from 'react-router'
import BackLink from '../../components/ui/BackLink.jsx'
import { formatMoney, formatSignedMoney, formatSignedPercent } from '../../components/ui/format.js'
import { holdings } from '../../services/mockData.js'

function HoldingDetailPage() {
  const { symbol } = useParams()
  const holding = holdings.find((h) => h.symbol === symbol)

  if (!holding) {
    return (
      <>
        <BackLink />
        <h1 tabIndex={-1} className="text-3xl font-semibold tracking-[-0.04em]">Holding not found</h1>
        <p className="mt-3 text-muted">This holding is not in the practice portfolio.</p>
      </>
    )
  }

  const value = holding.shares * holding.latestPrice
  const gain = (holding.latestPrice - holding.averagePrice) * holding.shares
  const gainPercent = ((holding.latestPrice - holding.averagePrice) / holding.averagePrice) * 100

  return (
    <>
      <BackLink />
      <p className="text-sm font-[650] tracking-[0.08em] text-muted uppercase">{holding.symbol}</p>
      <h1 tabIndex={-1} className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{holding.name}</h1>

      <p className="mt-6 text-sm font-[650] tracking-[0.08em] text-muted uppercase">Holding value</p>
      <p className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{formatMoney(value)}</p>

      <dl className="mt-6 flex flex-col gap-3">
        <div className="flex items-baseline justify-between rounded-xl border border-border p-4">
          <dt className="text-muted">Shares owned</dt>
          <dd className="font-[650]">{holding.shares}</dd>
        </div>
        <div className="flex items-baseline justify-between rounded-xl border border-border p-4">
          <dt className="text-muted">Average purchase price</dt>
          <dd className="font-[650]">{formatMoney(holding.averagePrice)}</dd>
        </div>
        <div className="flex items-baseline justify-between rounded-xl border border-border p-4">
          <dt className="text-muted">Latest price</dt>
          <dd className="font-[650]">{formatMoney(holding.latestPrice)}</dd>
        </div>
        <div className="flex items-baseline justify-between rounded-xl border border-border p-4">
          <dt className="text-muted">Gain / loss</dt>
          <dd className="font-[650]">
            {formatSignedMoney(gain)} ({formatSignedPercent(gainPercent)})
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          to="/market"
          className="inline-flex min-h-12 items-center justify-center rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink no-underline hover:bg-accent-hover"
        >
          Buy
        </Link>
        <Link
          to="/market"
          className="inline-flex min-h-12 items-center justify-center rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink no-underline hover:bg-hover"
        >
          Sell
        </Link>
        <Link
          to="/market"
          className="inline-flex min-h-12 items-center justify-center rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink no-underline hover:bg-hover"
        >
          Stock details
        </Link>
      </div>
    </>
  )
}

export default HoldingDetailPage
