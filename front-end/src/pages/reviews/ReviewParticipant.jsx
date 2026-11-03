
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
import ReviewNavigation from './ReviewNavigation.jsx'
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
      <main className="review-page">
        <h1>Review unavailable</h1>
        <p>Only completed rental participants can submit reviews.</p>
        <Link to="/browse">Back to Browse</Link>
      </main>
    )
  }

  if (existingReview) {
    return (
      <main className="review-page">
        <h1>Review already submitted</h1>
        <p>You have already reviewed this participant.</p>
        <Link to={`/users/${reviewedUserId}/reputation`}>
          View reputation
        </Link>
      </main>
    )
  }

  const otherUser = getUser(reviewedUserId)

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
    <main className="review-page">
      <header className="review-header">
        <Link to={`/bookings/${bookingId}`}>Back</Link>
        <strong>Review participant</strong>
        <span />
      </header>

      <div className="review-content">
        <article className="review-card">
          <h3>Completed rental #{bookingId}</h3>
          <p>
            Review your exchange with {otherUser?.name ?? 'Student'}
          </p>
        </article>

        <form className="review-form" onSubmit={handleSubmit}>
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

          <label htmlFor="reviewComment">
            Written review (optional)
          </label>
          <textarea
            id="reviewComment"
            rows={3}
            maxLength={500}
            value={comment}
            onChange={(event) => {
              setComment(event.target.value)
              setError('')
            }}
            placeholder="Share your experience"
          />

          <p>{comment.length} / 500 characters</p>

          {error && <p className="review-error" role="alert">{error}</p>}

          <button className="review-button review-primary" type="submit">
            Submit review
          </button>
        </form>
      </div>

      <ReviewNavigation />
    </main>
  )
}

export default ReviewParticipant
