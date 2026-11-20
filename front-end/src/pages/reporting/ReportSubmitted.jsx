import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getReport, resolveReportSubject } from '../../services/reports'
import './reporting.css'
import '../../styles/trust.css'

// Report submitted confirmation
function ReportSubmitted() {
  const { reportId } = useParams()
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    getReport(reportId).then(
      (report) => { if (current) setResult({ reportId, attempt, report }) },
      (error) => { if (current) setResult({ reportId, attempt, error }) },
    )
    return () => { current = false }
  }, [reportId, attempt])

  // A result for another report or an earlier attempt means the new one is still loading.
  if (result?.reportId !== reportId || result.attempt !== attempt) {
    return <main className="ds-page ds-trust report-page"><h1 className="ds-heading">Report confirmation</h1><p className="ds-status" role="status">Loading report...</p></main>
  }

  if (result.error?.status === 404) return <main className="ds-page ds-trust report-page"><h1 className="ds-heading">Report not found</h1><Link className="ds-text-link" to="/browse">Back to Browse</Link></main>

  if (result.error) {
    return (
      <main className="ds-page ds-trust report-page">
        <h1 className="ds-heading">Could not load report</h1>
        <p className="ds-feedback ds-feedback--error" role="alert">Could not load the report. {result.error.message}</p>
        <button type="button" className="ds-button ds-button--primary" onClick={() => setAttempt((value) => value + 1)}>
          Try again
        </button>
      </main>
    )
  }

  const { report } = result
  const { booking, conversation, listing } = resolveReportSubject(report)
  const related = booking ? 'rental' : conversation ? 'conversation' : 'listing'

  let backTo = '/browse'
  if (booking) backTo = `/bookings/${booking.id}`
  else if (conversation) backTo = `/inbox?conversation=${conversation.id}`
  else if (listing) backTo = `/browse/${listing.id}`

  return (
    <main className="ds-page ds-trust report-page">
      <h1 className="ds-heading">Report submitted</h1>

      <article className="trust-surface">
        <div>
          <h2>Report {report.id}</h2>
          {listing && <p>Related {related}: {listing.title}</p>}
          <p className="ds-status">Awaiting moderator review</p>
        </div>
      </article>

      <Link className="ds-button ds-button--primary" to={backTo}>{booking ? 'Back to rental' : conversation ? 'Back to conversation' : listing ? 'Back to listing' : 'Back to Browse'}</Link>
    </main>
  )
}

export default ReportSubmitted
