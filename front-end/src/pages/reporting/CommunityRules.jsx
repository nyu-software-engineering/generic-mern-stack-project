import { Link } from 'react-router-dom'
import './reporting.css'

// Community rules (M33). Static content.
function CommunityRules() {
  return (
    <main className="page report-page">
      <h1>Sharing within NYU</h1>

      <article className="rental-card">
        <div>
          <h3>Suitable items</h3>
          <p>Electronics, supplies, tools, sports gear, games and appropriate household items.</p>
        </div>
      </article>

      <article className="rental-card">
        <div>
          <h3>Prohibited items</h3>
          <p>Unsafe, illegal, age-restricted, controlled, medical, stolen or inappropriate goods.</p>
        </div>
      </article>

      <article className="rental-card">
        <div>
          <h3>Simple sharing rules</h3>
          <p>
            Meet in shared spaces. Agree on terms. Return items on time in the agreed condition.
            Report problems through DormShare.
          </p>
        </div>
      </article>

      <Link className="report-link" to="/report">Report a problem</Link>
    </main>
  )
}

export default CommunityRules
