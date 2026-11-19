import { useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getUser } from '../../services/bookings'
import { getOtherParticipant } from '../../services/chat'
import { CURRENT_USER_ID } from '../../services/mockDataService'
import { REPORT_REASONS, createReport, resolveReportSubject } from '../../services/reports'
import './reporting.css'
import '../../styles/trust.css'

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
  const [invalidField, setInvalidField] = useState('')
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
  let backLabel = 'Back to community rules'
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
      const field = !reason.value ? 'reason' : 'description'
      flushSync(() => {
        setInvalidField(field)
        setError('Please choose a reason and describe what happened.')
      })
      event.currentTarget.elements[field].focus()
      return
    }

    setInvalidField('')
    setError('')
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
    <main className="ds-page ds-trust report-page">
      <h1 className="ds-heading">Report a problem</h1>

      {listing && (
        <article className="trust-surface">
          <div>
            <h2>{listing.title}</h2>
            <p>{people}</p>
          </div>
        </article>
      )}

      <form className="report-form trust-surface" onSubmit={handleSubmit} aria-busy={submitting} onChange={(event) => {
        if (invalidField) {
          if (event.target.name !== invalidField || !event.target.value.trim()) return
          setInvalidField('')
        }
        setError('')
      }}>
        <div>
          <label htmlFor="reason">Reason</label>
          <select id="reason" name="reason" className="ds-field" defaultValue="" required aria-invalid={invalidField === 'reason' || undefined} aria-describedby={invalidField === 'reason' ? 'report-error' : undefined}>
            <option value="" disabled>Select a reason</option>
            {REPORT_REASONS.map((reason) => <option key={reason}>{reason}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="description">What happened?</label>
          <textarea id="description" name="description" className="ds-field" placeholder="Describe the issue" maxLength={2000} required aria-invalid={invalidField === 'description' || undefined} aria-describedby={invalidField === 'description' ? 'report-description-help report-error' : 'report-description-help'} />
          <p className="trust-meta" id="report-description-help">Describe what happened in up to 2,000 characters.</p>
        </div>

        <div>
          <label htmlFor="image">Add supporting image (optional)</label>
          <input id="image" name="image" type="file" className="ds-field" accept="image/*" aria-describedby="report-image-help" />
          <p className="trust-meta" id="report-image-help">Only the file name is saved. The image is not uploaded.</p>
        </div>

        <button type="submit" className="ds-button ds-button--primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit report'}
        </button>
      </form>

      {error && <p role="alert" id="report-error" className="ds-feedback ds-feedback--error">{error}</p>}

      <Link className="ds-text-link" to={backTo}>{backLabel}</Link>
    </main>
  )
}

export default Report
