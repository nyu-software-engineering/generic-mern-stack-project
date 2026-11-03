import { Link } from 'react-router'
import PageIntro from '../../components/layout/PageIntro.jsx'
import { formatMoney, formatSignedMoney, formatSignedPercent } from '../../components/ui/format.js'
import { holdings, portfolio } from '../../services/mockData.js'

const holdingsValue = holdings.reduce((sum, h) => sum + h.shares * h.latestPrice, 0)

function PortfolioPage() {
  return (
    <>
      <PageIntro
        eyebrow="Practice account"
        title="Portfolio"
        description="Your virtual investments at a glance."
      />

      <section aria-label="Portfolio summary" className="rounded-2xl border border-border p-6">
        <p className="text-sm font-[650] tracking-[0.08em] text-muted uppercase">Total portfolio value</p>
        <p className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{formatMoney(portfolio.totalValue)}</p>
        <p className="mt-2 text-muted">
          Cash {formatMoney(portfolio.cash)} + holdings {formatMoney(holdingsValue)}
        </p>
        <p className="mt-1 font-[650]">
          Since starting {formatSignedMoney(portfolio.changeAmount)} ({formatSignedPercent(portfolio.changePercent)})
        </p>
        <Link
          to="/portfolio/performance"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink no-underline hover:bg-hover"
        >
          View performance
        </Link>
      </section>

      <section aria-label="Holdings" className="mt-8">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">Holdings</h2>
        {holdings.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border p-6">
            <p className="font-[650]">No investments yet</p>
            <p className="mt-1 text-muted">Find a company and make your first practice trade.</p>
            <Link
              to="/market"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink no-underline hover:bg-accent-hover"
            >
              Explore market
            </Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {holdings.map((holding) => {
              const value = holding.shares * holding.latestPrice
              const gain = (holding.latestPrice - holding.averagePrice) * holding.shares
              return (
                <li key={holding.symbol}>
                  <Link
                    to={`/portfolio/holdings/${holding.symbol}`}
                    className="block rounded-2xl border border-border p-5 text-ink no-underline hover:bg-hover"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-[650]">
                        {holding.symbol} <span className="text-muted">| {holding.name}</span>
                      </p>
                      <p className="font-[650]">{formatMoney(value)}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {holding.shares} shares · Gain {formatSignedMoney(gain)}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Link
        to="/portfolio/transactions"
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink no-underline hover:bg-hover"
      >
        Transaction history
      </Link>
    </>
  )
}

export default PortfolioPage
