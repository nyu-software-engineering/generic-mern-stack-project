import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getUser } from '../../services/bookings'
import { getOtherParticipant } from '../../services/chat'
import { CURRENT_USER_ID } from '../../services/mockDataService'
import { REPORT_REASONS, createReport, resolveReportSubject } from '../../services/reports'
import './reporting.css'

// Report a problem (M34). The subject comes from the link that opened the form:
// ?rentalId=<id>, ?conversationId=<id> or ?listingId=<id>. With none it is a general report.
function Report() {
  const [searchParams] = useSearchParams()
  const ids = {
    rentalId: searchParams.get('rentalId') ?? '',
    conversationId: searchParams.get('conversationId') ?? '',
    listingId: searchParams.get('listingId') ?? '',
  }
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const { booking, conversation, listing } = resolveReportSubject(ids)

  let people = ''
  if (booking) {
    people = `${getUser(booking.ownerId)?.name} and ${getUser(booking.borrowerId)?.name}`
  } else if (conversation) {
    people = `Conversation with ${getOtherParticipant(conversation, CURRENT_USER_ID)?.name}`
  } else if (listing) {
    people = `Listed by ${getUser(listing.ownerId)?.name}`
  }

  let backTo = '/community-rules'
  let backLabel = 'Back'
  if (booking) {
    backTo = `/bookings/${booking.id}`
    backLabel = 'Back to rental'
  } else if (conversation) {
    backTo = `/inbox?conversation=${conversation.id}`
    backLabel = 'Back to conversation'
  } else if (listing) {
    backTo = `/browse/${listing.id}`
    backLabel = 'Back to listing'
  }

  // Only links that matched a real record are sent. The listing comes from the rental
  // or conversation when there is one, so the links can't disagree.
  const subjectIds = {
    rentalId: booking ? booking.id : '',
    conversationId: conversation ? conversation.id : '',
    listingId: booking || conversation ? '' : (listing?.id ?? ''),
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const { reason, description, image } = event.currentTarget.elements

    if (!reason.value || !description.value.trim()) {
      setError('Please choose a reason and describe what happened.')
      return
    }

    // One report per click: the button stays disabled until the back-end answers.
    setSubmitting(true)
    try {
      const report = await createReport({
        ...subjectIds,
        reason: reason.value,
        description: description.value,
        imageName: image.files[0]?.name ?? '',
      })
      navigate(`/report/submitted/${report.id}`)
    } catch (submitError) {
      setError(submitError.status === 400
        ? 'We could not submit this report. Check the details, and that you are part of this rental or conversation.'
        : `Could not submit the report. ${submitError.message}`)
      setSubmitting(false)
    }
  }

  return (
    <main className="page report-page">
      <h1>Report a problem</h1>

      {listing && (
        <article className="rental-card">
          <div>
            <h3>{listing.title}</h3>
            <p>{people}</p>
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
          <textarea id="description" name="description" placeholder="Describe the issue" maxLength={2000} required />
        </div>

        <div>
          <label htmlFor="image">Add supporting image (optional)</label>
          <input id="image" name="image" type="file" accept="image/*" />
        </div>

        <button type="submit" className="report-button" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit report'}
        </button>
      </form>

      {error && <p role="alert" className="report-error">{error}</p>}

      <Link className="report-link" to={backTo}>{backLabel}</Link>
    </main>
  )
}

export default Report
