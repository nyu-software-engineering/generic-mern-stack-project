
import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getListings, getUser } from '../../services/mockDataService.js'
import {
  getReputation,
  getReviewTarget,
  getReviewableRentals,
} from '../../services/reviews.js'
import '../../styles/trust.css'
import './reviews.css'

function Reputation() {
  const { userId } = useParams()

  return <ReputationContent key={userId} userId={userId} />
}

function ReputationContent({ userId }) {
  const { currentUser } = useContext(AuthContext)
  const [showListings, setShowListings] = useState(false)
  const [retry, setRetry] = useState(0)
  const [reviewRetry, setReviewRetry] = useState(0)

  const [result, setResult] = useState({
    status: 'loading',
    reputation: null,
    error: '',
  })

  const [reviewableResult, setReviewableResult] = useState({
    status: 'loading',
    rentals: [],
    error: '',
  })

  const isOwnProfile = Boolean(
    currentUser && String(currentUser.id) === String(userId)
  )

  useEffect(() => {
    let active = true

    getReputation(userId).then(
      (reputation) => {
        if (!active) return
        setResult({
          status: 'ready',
          reputation,
          error: '',
        })
      },
      (error) => {
        if (!active) return
        setResult({
          status: error.status === 404 ? 'not-found' : 'error',
          reputation: null,
          error: error.message,
        })
      }
    )

    return () => { active = false }
  }, [userId, retry])

  useEffect(() => {
    if (!isOwnProfile) return undefined

    let active = true

    getReviewableRentals(userId).then(
      (rentals) => {
        if (!active) return
        setReviewableResult({
          status: 'ready',
          rentals,
          error: '',
        })
      },
      (error) => {
        if (!active) return
        setReviewableResult({
          status: 'error',
          rentals: [],
          error: error.message,
        })
      }
    )

    return () => { active = false }
  }, [userId, isOwnProfile, reviewRetry])

  function retryReputation() {
    setResult({
      status: 'loading',
      reputation: null,
      error: '',
    })
    setRetry((value) => value + 1)
  }

  function retryReviewable() {
    setReviewableResult({
      status: 'loading',
      rentals: [],
      error: '',
    })
    setReviewRetry((value) => value + 1)
  }

  if (result.status === 'loading') {
    return (
      <main className="ds-page ds-trust review-page">
        <p role="status">Loading reputation...</p>
      </main>
    )
  }

  if (result.status === 'not-found') {
    return (
      <main className="ds-page ds-trust review-page">
        <header className="trust-header review-header">
          <h1 className="ds-heading">Student not found</h1>
          <Link to="/browse" className="ds-text-link">
            Back to Browse
          </Link>
        </header>
      </main>
    )
  }

  if (result.status === 'error') {
    return (
      <main className="ds-page ds-trust review-page">
        <h1 className="ds-heading">Could not load reputation</h1>
        <p className="ds-feedback ds-feedback--error" role="alert">
          {result.error}
        </p>
        <button
          type="button"
          className="ds-button ds-button--secondary"
          onClick={retryReputation}
        >
          Try again
        </button>
      </main>
    )
  }

  const { user, reviews, averageRating } = result.reputation

  const initials = (user.name || 'Student')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const listings = getListings().filter(
    (listing) =>
      String(listing.ownerId) === String(userId) &&
      listing.status === 'published'
  )

  const reviewable = reviewableResult.rentals

  return (
    <main className="ds-page ds-trust review-page">
      <header className="trust-header review-header">
        <div className="review-profile">
          <div className="review-avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <h1 className="ds-heading">{user.name}</h1>
            <p className="trust-meta">
              {averageRating === null
                ? 'Not rated yet'
                : `${averageRating.toFixed(1)} / 5`}
              {user.completedRentals != null && (
                <>
                  {' · '}
                  {user.completedRentals} completed{' '}
                  {user.completedRentals === 1 ? 'rental' : 'rentals'}
                </>
              )}
            </p>
          </div>
        </div>
        <Link to="/browse" className="ds-text-link">
          Back to Browse
        </Link>
      </header>

      <div className="review-content">
        <section>
          <h2>Reviews received ({reviews.length})</h2>

          {reviews.length === 0 ? (
            <p className="trust-surface trust-empty">
              No reviews yet.
            </p>
          ) : (
            reviews.map((review) => (
              <article
                className="trust-surface review-card"
                key={review.id}
              >
                <h3>
                  Review from{' '}
                  {getUser(review.reviewerId)?.name ?? 'Student'}
                </h3>
                <p>Overall: {review.overallRating} / 5</p>
                <p className="trust-meta">
                  Communication: {review.communicationRating} / 5
                  {' · '}
                  Item care: {review.itemCareRating} / 5
                </p>
                {review.comment && <p>{review.comment}</p>}
              </article>
            ))
          )}
        </section>

        <button
          type="button"
          className="ds-button ds-button--secondary review-button"
          onClick={() => setShowListings((value) => !value)}
          aria-expanded={showListings}
          aria-controls="reputation-listings"
        >
          {showListings ? 'Hide listings' : "View student's listings"}
        </button>

        <section id="reputation-listings" hidden={!showListings}>
          <h2>Available listings</h2>
          {listings.length === 0 ? (
            <p className="trust-surface trust-empty">
              No published listings.
            </p>
          ) : (
            listings.map((listing) => (
              <div
                className="trust-surface review-card"
                key={listing.id}
              >
                <Link
                  to={`/browse/${listing.id}`}
                  className="ds-text-link"
                >
                  {listing.title}
                </Link>
              </div>
            ))
          )}
        </section>

        {isOwnProfile && (
          <section>
            <h2>Rentals you can review</h2>

            {reviewableResult.status === 'loading' && (
              <p role="status">Loading completed rentals...</p>
            )}

            {reviewableResult.status === 'error' && (
              <div className="trust-surface review-card">
                <p role="alert">{reviewableResult.error}</p>
                <button
                  type="button"
                  className="ds-button ds-button--secondary"
                  onClick={retryReviewable}
                >
                  Try again
                </button>
              </div>
            )}

            {reviewableResult.status === 'ready' && (
              reviewable.length === 0 ? (
                <p className="trust-surface trust-empty">
                  No completed rentals waiting for review.
                </p>
              ) : (
                reviewable.map((rental) => {
                  const otherId = getReviewTarget(
                    rental,
                    currentUser.id
                  )
                  const other = getUser(otherId)

                  return (
                    <div
                      className="trust-surface review-card"
                      key={rental.id}
                    >
                      <p>
                        Booking #{rental.id} with{' '}
                        {other?.name ?? 'Student'}
                      </p>
                      <Link
                        to={`/bookings/${rental.id}/review`}
                        className="ds-text-link"
                      >
                        Write review
                      </Link>
                    </div>
                  )
                })
              )
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default Reputation