import { Link } from 'react-router'
import PageIntro from '../../components/layout/PageIntro.jsx'

function MarketPage() {
  return (
    <section>
      <PageIntro
        eyebrow="Find your next idea"
        title="Market"
        description="Explore stocks and ETFs, follow investments that interest you, and practice making investing decisions."
      />
      <Link className="inline-flex min-h-11 items-center font-[650] underline underline-offset-[0.3em]" to="/learn">Learn the investing basics →</Link>
    </section>
  )
}

export default MarketPage
