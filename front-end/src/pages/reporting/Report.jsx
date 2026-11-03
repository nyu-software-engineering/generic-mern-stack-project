import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getBooking, getListing, getUser } from '../../services/bookings'
import { REPORT_REASONS, createReport } from '../../services/reports'
import './reporting.css'

// Report a problem (M34). Pass ?rentalId=<id> to attach the report to a rental.
function Report() {
  const [searchParams] = useSearchParams()
  const rentalId = searchParams.get('rentalId') ?? ''
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const booking = rentalId ? getBooking(rentalId) : undefined
  const listing = booking && getListing(booking.listingId)

  function handleSubmit(event) {
    event.preventDefault()
    const { reason, description, image } = event.currentTarget.elements

    const report = createReport({
      rentalId,
      reason: reason.value,
      description: description.value,
      imageName: image.files[0]?.name ?? '',
    })

    if (!report) {
      setError('Please choose a reason and describe what happened.')
      return
    }

    navigate(`/report/submitted/${report.id}`)
  }

  return (
    <main className="page report-page">
      <h1>Report a problem</h1>

      {listing && (
        <article className="rental-card">
          <div>
            <h3>{listing.title}</h3>
            <p>{getUser(booking.ownerId)?.name} and {getUser(booking.borrowerId)?.name}</p>
          </div>
        </article>
      )}

      <form className="report-form" onSubmit={handleSubmit} onChange={() => setError('')}>
        <div>
          <label htmlFor="reason">Reason</label>
          <select id="reason" name="reason" defaultValue="" required>
            <option value="" disabled>Select a reason</option>
            {REPORT_REASONS.map((reason) => <option key={reason}>{reason}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="description">What happened?</label>
          <textarea id="description" name="description" placeholder="Describe the issue" required />
        </div>

        <div>
          <label htmlFor="image">Add supporting image (optional)</label>
          <input id="image" name="image" type="file" accept="image/*" />
        </div>

        <button type="submit" className="report-button">Submit report</button>
      </form>

      {error && <p role="alert" className="report-error">{error}</p>}

      <Link className="report-link" to={booking ? `/bookings/${booking.id}` : '/community-rules'}>Back to rental</Link>
    </main>
  )
}

export default Report
