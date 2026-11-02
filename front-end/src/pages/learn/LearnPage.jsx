import { Link } from 'react-router'
import PageIntro from '../../components/layout/PageIntro.jsx'

function LearnPage() {
  return (
    <section>
      <PageIntro
        eyebrow="One concept at a time"
        title="Learn"
        description="Build your understanding of investing with short lessons and simple explanations."
      />
      <Link className="inline-flex min-h-11 items-center font-[650] underline underline-offset-[0.3em]" to="/market">Explore the market →</Link>
    </section>
  )
}

export default LearnPage
