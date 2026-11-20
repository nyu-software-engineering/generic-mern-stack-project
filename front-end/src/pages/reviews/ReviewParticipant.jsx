import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CURRENT_USER_ID,
  getRental,
  getUser,
} from '../../services/mockDataService.js'
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
  const navigate = useNavigate()

  const [ratings, setRatings] = useState({
    communicationRating: 0,
    itemCareRating: 0,
    overallRating: 0,
  })
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const rental = getRental(bookingId)
  const reviewedUserId = getReviewTarget(rental, CURRENT_USER_ID)
  const existingReview = getReviewForBooking(
    bookingId,
    CURRENT_USER_ID
  )

  if (!reviewedUserId) {
    return (
      <main className="ds-page ds-trust review-page">
        <header className="trust-header review-header">
          <div>
            <h1 className="ds-heading">Review unavailable</h1>
            <p>Only completed rental participants can submit reviews.</p>
          </div>
          <Link to="/browse" className="ds-text-link">Back to Browse</Link>
        </header>
      </main>
    )
  }

  if (existingReview) {
    return (
      <main className="ds-page ds-trust review-page">
        <header className="trust-header review-header">
          <div>
            <h1 className="ds-heading">Review already submitted</h1>
            <p>You have already reviewed this participant.</p>
          </div>
          <Link to={`/users/${reviewedUserId}/reputation`} className="ds-text-link">
            View reputation
          </Link>
        </header>
      </main>
    )
  }

  const otherUser = getUser(reviewedUserId)
  const hasCommentError = error === 'Written feedback must be 500 characters or less.'

  function handleSubmit(event) {
    event.preventDefault()

    try {
      submitReview({
        bookingId,
        reviewerId: CURRENT_USER_ID,
        ...ratings,
        comment,
      })

      navigate(`/users/${reviewedUserId}/reputation`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="ds-page ds-trust review-page">
      <header className="trust-header review-header">
        <h1 className="ds-heading">Review participant</h1>
        <Link to={`/bookings/${bookingId}`} className="ds-text-link">Back to rental</Link>
      </header>

      <div className="review-content">
        <article className="trust-surface review-card">
          <h2>Completed rental #{bookingId}</h2>
          <p>
            Review your exchange with {otherUser?.name ?? 'Student'}.
          </p>
        </article>

        <form className="trust-surface review-form" onSubmit={handleSubmit}>
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
              value={comment}
              aria-invalid={hasCommentError || undefined}
              aria-describedby={hasCommentError ? 'reviewCommentCount reviewFormError' : 'reviewCommentCount'}
              onChange={(event) => {
                setComment(event.target.value)
                setError('')
              }}
              placeholder="Share your experience"
            />
            <p id="reviewCommentCount" className="trust-meta">{comment.length} / 500 characters</p>
          </div>

          {error && (
            <p id="reviewFormError" className="ds-feedback ds-feedback--error review-error" role="alert">
              {error}
            </p>
          )}

          <button className="ds-button ds-button--primary review-button" type="submit">
            Submit review
          </button>
        </form>
      </div>
    </main>
  )
}

export default ReviewParticipant
