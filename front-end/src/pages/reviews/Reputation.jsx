import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CURRENT_USER_ID,
  getListings,
  getUser,
} from '../../services/mockDataService.js'
import {
  getReputation,
  getReviewTarget,
  getReviewableRentals,
} from '../../services/reviews.js'
import '../../styles/trust.css'
import './reviews.css'

function Reputation() {
  const { userId } = useParams()
  const [showListings, setShowListings] = useState(false)
  const reputation = getReputation(userId)

  if (!reputation) {
    return (
      <main className="ds-page ds-trust review-page">
        <header className="trust-header review-header">
          <h1 className="ds-heading">Student not found</h1>
          <Link to="/browse" className="ds-text-link">Back to Browse</Link>
        </header>
      </main>
    )
  }

  const { user, reviews, averageRating } = reputation
  const isOwnProfile = userId === CURRENT_USER_ID
  const initials = user.name.trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]).join('').toUpperCase()

  const reviewable = isOwnProfile
    ? getReviewableRentals(CURRENT_USER_ID)
    : []

  const listings = getListings().filter(
    (listing) =>
      String(listing.ownerId) === String(userId) &&
      listing.status === 'published'
  )

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
                  {user.completedRentals} completed {user.completedRentals === 1 ? 'rental' : 'rentals'}
                </>
              )}
            </p>
          </div>
        </div>
        <Link to="/browse" className="ds-text-link">Back to Browse</Link>
      </header>

      <div className="review-content">
        <section>
          <h2>Reviews received ({reviews.length})</h2>

          {reviews.length === 0 ? (
            <p className="trust-surface trust-empty">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <article className="trust-surface review-card" key={review.id}>
                <h3>
                  Review from {getUser(review.reviewerId)?.name ?? 'Student'}
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
            <p className="trust-surface trust-empty">No published listings.</p>
          ) : (
            listings.map((listing) => (
              <div className="trust-surface review-card" key={listing.id}>
                <Link to={`/browse/${listing.id}`} className="ds-text-link">
                  {listing.title}
                </Link>
              </div>
            ))
          )}
        </section>

        {isOwnProfile && (
          <section>
            <h2>Rentals you can review</h2>

            {reviewable.length === 0 ? (
              <p className="trust-surface trust-empty">No completed rentals waiting for review.</p>
            ) : (
              reviewable.map((rental) => {
                const otherId = getReviewTarget(
                  rental,
                  CURRENT_USER_ID
                )
                const other = getUser(otherId)

                return (
                  <div className="trust-surface review-card" key={rental.id}>
                    <p>
                      Booking #{rental.id} with {other?.name ?? 'Student'}
                    </p>
                    <Link to={`/bookings/${rental.id}/review`} className="ds-text-link">
                      Write review
                    </Link>
                  </div>
                )
              })
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default Reputation
