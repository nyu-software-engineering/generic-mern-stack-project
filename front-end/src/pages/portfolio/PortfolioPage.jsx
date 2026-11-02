import { Link } from 'react-router'
import PageIntro from '../../components/layout/PageIntro.jsx'

function PortfolioPage() {
  return (
    <section>
      <PageIntro
        eyebrow="Your practice account"
        title="Portfolio"
        description="A place to follow your virtual investments, available cash, and progress over time."
      />
      <Link className="inline-flex min-h-11 items-center font-[650] underline underline-offset-[0.3em]" to="/market">Explore the market →</Link>
    </section>
  )
}

export default PortfolioPage
