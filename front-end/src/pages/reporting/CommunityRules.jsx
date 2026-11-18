import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCommunityRules } from '../../services/reports'
import './reporting.css'

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
    <main className="page report-page">
      <h1>Sharing within NYU</h1>

      {loading && <p role="status">Loading rules...</p>}

      {!loading && result.error && (
        <div>
          <p role="alert">Could not load the community rules. {result.error.message}</p>
          <button type="button" className="report-button" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && result.rules?.map((rule) => (
        <article className="rental-card" key={rule.id}>
          <div>
            <h3>{rule.title}</h3>
            <p>{rule.body}</p>
          </div>
        </article>
      ))}

      <Link className="report-link" to="/report">Report a problem</Link>
    </main>
  )
}

export default CommunityRules
