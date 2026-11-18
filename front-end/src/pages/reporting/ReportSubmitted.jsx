import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getReport, resolveReportSubject } from '../../services/reports'
import './reporting.css'

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
    return <main className="page"><p role="status">Loading report...</p></main>
  }

  if (result.error?.status === 404) return <main className="page"><p>Report not found.</p></main>

  if (result.error) {
    return (
      <main className="page">
        <p role="alert">Could not load the report. {result.error.message}</p>
        <button type="button" className="report-button" onClick={() => setAttempt((value) => value + 1)}>
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
    <main className="page report-page">
      <h1>Report submitted</h1>

      <article className="rental-card">
        <div>
          <h3>Report {report.id}</h3>
          {listing && <p>Related {related}: {listing.title}</p>}
          <p>Awaiting moderator review</p>
        </div>
      </article>

      <Link className="report-button" to={backTo}>Back to transactions</Link>
    </main>
  )
}

export default ReportSubmitted
