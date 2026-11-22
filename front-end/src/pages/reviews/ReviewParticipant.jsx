
import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { api } from '../../services/api.js'
import { getUser } from '../../services/mockDataService.js'
import {
  getReviewForBooking,
  getReviewTarget,
  submitReview,
} from '../../services/reviews.js'
import '../../styles/trust.css'
import './reviews.css'

const ratingFields = [
  { key: 'communicationRating', label: 'Communication' },
  { key: 'itemCareRating', label: 'Item condition / care' },
  { key: 'overallRating', label: 'Overall experience' },
]

function ReviewParticipant() {
  const { bookingId } = useParams()

  return (
    <ReviewParticipantContent
      key={bookingId}
      bookingId={bookingId}
    />
  )
}

function ReviewParticipantContent({ bookingId }) {
  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [result, setResult] = useState({
    status: 'loading',
    rental: null,
    existingReview: null,
    error: '',
  })
  const [retry, setRetry] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [ratings, setRatings] = useState({
    communicationRating: 0,
    itemCareRating: 0,
    overallRating: 0,
  })
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentUser) return undefined

    let active = true

    Promise.all([
      api(`/bookings/${encodeURIComponent(bookingId)}`),
      getReviewForBooking(bookingId),
    ]).then(
      ([rental, existingReview]) => {
        if (!active) return

        setResult({
          status: 'ready',
          rental,
          existingReview,
          error: '',
        })
      },
      (loadError) => {
        if (!active) return

        setResult({
          status: 'error',
          rental: null,
          existingReview: null,
          error: loadError.message,
        })
      }
    )

    return () => { active = false }
  }, [bookingId, currentUser, retry])

  if (!currentUser) {
    return (
      <main className="ds-page ds-trust review-page">
        <header className="trust-header review-header">
          <div>
            <h1 className="ds-heading">Sign in to review</h1>
            <p>You must sign in before submitting a review.</p>
          </div>
          <Link to="/login" className="ds-text-link">
            Sign in
          </Link>
        </header>
      </main>
    )
  }

  if (result.status === 'loading') {
    return (
      <main className="ds-page ds-trust review-page">
        <p role="status">Loading booking and review...</p>
      </main>
    )
  }

  if (result.status === 'error') {
    return (
      <main className="ds-page ds-trust review-page">
        <h1 className="ds-heading">Review unavailable</h1>
        <p className="ds-feedback ds-feedback--error" role="alert">
          {result.error}
        </p>
        <button
          type="button"
          className="ds-button ds-button--secondary"
          onClick={() => {
            setResult({
              status: 'loading',
              rental: null,
              existingReview: null,
              error: '',
            })
            setRetry((value) => value + 1)
          }}
        >
          Try again
        </button>
      </main>
    )
  }

  const reviewedUserId = getReviewTarget(
    result.rental,
    currentUser.id
  )

  if (!reviewedUserId) {
    return (
      <main className="ds-page ds-trust review-page">
        <header className="trust-header review-header">
          <div>
            <h1 className="ds-heading">Review unavailable</h1>
            <p>
              Only completed rental participants can submit reviews.
            </p>
          </div>
          <Link to="/browse" className="ds-text-link">
            Back to Browse
          </Link>
        </header>
      </main>
    )
  }

  if (result.existingReview) {
    return (
      <main className="ds-page ds-trust review-page">
        <header className="trust-header review-header">
          <div>
            <h1 className="ds-heading">Review already submitted</h1>
            <p>You have already reviewed this participant.</p>
          </div>
          <Link
            to={`/users/${reviewedUserId}/reputation`}
            className="ds-text-link"
          >
            View reputation
          </Link>
        </header>
      </main>
    )
  }

  const otherUser = getUser(reviewedUserId)

  const hasCommentError =
    error === 'Written feedback must be 500 characters or less.'

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting) return

    setSubmitting(true)
    setError('')

    try {
      await submitReview({
        bookingId,
        ...ratings,
        comment,
      })

      navigate(`/users/${reviewedUserId}/reputation`)
    } catch (submitError) {
      if (
        submitError.status === 409 &&
        /already reviewed/i.test(submitError.message)
      ) {
        setResult((previous) => ({
          ...previous,
          existingReview: { alreadySubmitted: true },
        }))
      } else {
        setError(
          submitError.message || 'Could not submit your review.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="ds-page ds-trust review-page">
      <header className="trust-header review-header">
        <h1 className="ds-heading">Review participant</h1>
        <Link
          to={`/bookings/${bookingId}`}
          className="ds-text-link"
        >
          Back to rental
        </Link>
      </header>

      <div className="review-content">
        <article className="trust-surface review-card">
          <h2>Completed rental #{bookingId}</h2>
          <p>
            Review your exchange with{' '}
            {otherUser?.name ?? 'Student'}.
          </p>
        </article>

        <form
          className="trust-surface review-form"
          onSubmit={handleSubmit}
          aria-busy={submitting}
        >
          {ratingFields.map(({ key, label }) => (
            <fieldset className="review-fieldset" key={key}>
              <legend>{label}</legend>
              <div className="review-rating-options">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={key}
                      value={value}
                      checked={ratings[key] === value}
                      disabled={submitting}
                      onChange={() => {
                        setRatings((previous) => ({
                          ...previous,
                          [key]: value,
                        }))
                        setError('')
                      }}
                      required
                    />
                    {value}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <div className="review-comment">
            <label htmlFor="reviewComment">
              Written review (optional)
            </label>
            <textarea
              id="reviewComment"
              className="ds-field"
              rows={3}
              maxLength={500}
              disabled={submitting}
              value={comment}
              aria-invalid={hasCommentError || undefined}
              aria-describedby={
                hasCommentError
                  ? 'reviewCommentCount reviewFormError'
                  : 'reviewCommentCount'
              }
              onChange={(event) => {
                setComment(event.target.value)
                setError('')
              }}
              placeholder="Share your experience"
            />
            <p id="reviewCommentCount" className="trust-meta">
              {comment.length} / 500 characters
            </p>
          </div>

          {error && (
            <p
              id="reviewFormError"
              className="ds-feedback ds-feedback--error review-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="ds-button ds-button--primary review-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default ReviewParticipant