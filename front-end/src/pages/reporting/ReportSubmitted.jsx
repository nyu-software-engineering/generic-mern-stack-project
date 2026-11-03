import { Link, useParams } from 'react-router-dom'
import { getReport, resolveReportSubject } from '../../services/reports'
import './reporting.css'

// Report submitted confirmation
function ReportSubmitted() {
  const { reportId } = useParams()
  const report = getReport(reportId)

  if (!report) return <main className="page"><p>Report not found.</p></main>

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
