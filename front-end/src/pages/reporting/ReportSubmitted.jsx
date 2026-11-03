import { Link, useParams } from 'react-router-dom'
import { getBooking, getListing } from '../../services/bookings'
import { getReport } from '../../services/reports'
import './reporting.css'

// Report submitted confirmation
function ReportSubmitted() {
  const { reportId } = useParams()
  const report = getReport(reportId)

  if (!report) return <main className="page"><p>Report not found.</p></main>

  const booking = report.rentalId ? getBooking(report.rentalId) : undefined
  const listing = booking && getListing(booking.listingId)

  return (
    <main className="page report-page">
      <h1>Report submitted</h1>

      <article className="rental-card">
        <div>
          <h3>Report {report.id}</h3>
          {listing && <p>Related rental: {listing.title}</p>}
          <p>Awaiting moderator review</p>
        </div>
      </article>

      <Link className="report-button" to={booking ? `/bookings/${booking.id}` : '/browse'}>Back to transactions</Link>
    </main>
  )
}

export default ReportSubmitted
