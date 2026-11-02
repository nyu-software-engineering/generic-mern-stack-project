import { Link } from 'react-router'
import PageIntro from '../../components/layout/PageIntro.jsx'

function AccountPage() {
  return (
    <section>
      <PageIntro
        eyebrow="Your StockSim space"
        title="Account"
        description="A place for your profile, learning progress, achievements, and sharing preferences."
      />
      <Link className="inline-flex min-h-11 items-center font-[650] underline underline-offset-[0.3em]" to="/">Back to welcome →</Link>
    </section>
  )
}

export default AccountPage
