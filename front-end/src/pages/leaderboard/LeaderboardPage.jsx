import { Link } from 'react-router'
import PageIntro from '../../components/layout/PageIntro.jsx'

function LeaderboardPage() {
  return (
    <section>
      <PageIntro
        eyebrow="Practice together"
        title="Leaderboard"
        description="Compare investing progress with other learners. Sharing your own performance is always optional."
      />
      <Link className="inline-flex min-h-11 items-center font-[650] underline underline-offset-[0.3em]" to="/portfolio">View your portfolio →</Link>
    </section>
  )
}

export default LeaderboardPage
