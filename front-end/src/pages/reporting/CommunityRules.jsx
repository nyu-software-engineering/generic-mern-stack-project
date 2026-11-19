import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCommunityRules } from '../../services/reports'
import './reporting.css'
import '../../styles/trust.css'

// Community rules (M33). The rules come from the back-end.
function CommunityRules() {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    getCommunityRules().then(
      (rules) => { if (current) setResult({ attempt, rules }) },
      (error) => { if (current) setResult({ attempt, error }) },
    )
    return () => { current = false }
  }, [attempt])

  const loading = result?.attempt !== attempt

  return (
    <main className="ds-page ds-trust report-page">
      <h1 className="ds-heading">Sharing within NYU</h1>

      {loading && <p className="ds-status" role="status">Loading rules...</p>}

      {!loading && result.error && (
        <div>
          <p className="ds-feedback ds-feedback--error" role="alert">Could not load the community rules. {result.error.message}</p>
          <button type="button" className="ds-button ds-button--primary" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && result.rules?.map((rule) => (
        <article className="trust-surface" key={rule.id}>
          <div>
            <h2>{rule.title}</h2>
            <p>{rule.body}</p>
          </div>
        </article>
      ))}

      {!loading && !result.error && result.rules?.length === 0 && (
        <div className="ds-feedback">
          <h2>No rules available</h2>
          <p>Try loading the community rules again.</p>
          <button className="ds-button ds-button--secondary" type="button" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
        </div>
      )}

      <Link className="ds-text-link" to="/report">Report a problem</Link>
    </main>
  )
}

export default CommunityRules
