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
import ReviewNavigation from './ReviewNavigation.jsx'
import './reviews.css'

function Reputation() {
  const { userId } = useParams()
  const [showListings, setShowListings] = useState(false)
  const reputation = getReputation(userId)

  if (!reputation) {
    return (
      <main className="review-page">
        <h1>Student not found</h1>
        <Link to="/browse">Back to Browse</Link>
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
    <main className="review-page">
      <header className="review-header">
        <Link to="/browse">Back</Link>
        <strong>Student reputation</strong>
        <span />
      </header>

      <div className="review-content">
        <div className="review-avatar" aria-hidden="true">
          {initials}
        </div>

        <h1>{user.name}</h1>
        <p>Verified NYU student</p>
        <p>
          {averageRating === null
            ? 'Not rated yet'
            : `${averageRating.toFixed(1)} / 5`}
          {' · '}
          {user.completedRentals ?? 0} completed rentals
        </p>

        <h2>Reviews received ({reviews.length})</h2>

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <h3>
                Review from {getUser(review.reviewerId)?.name ?? 'Student'}
              </h3>
              <p>Overall: {review.overallRating} / 5</p>
              <p>
                Communication: {review.communicationRating} / 5
                {' · '}
                Item care: {review.itemCareRating} / 5
              </p>
              {review.comment && <p>{review.comment}</p>}
            </article>
          ))
        )}

        <button
          type="button"
          className="review-button review-secondary"
          onClick={() => setShowListings((value) => !value)}
          aria-expanded={showListings}
        >
          {showListings ? 'Hide listings' : "View student's listings"}
        </button>

        {showListings && (
          <section>
            <h2>Available listings</h2>
            {listings.length === 0 ? (
              <p>No published listings.</p>
            ) : (
              listings.map((listing) => (
                <div className="review-card" key={listing.id}>
                  <Link to={`/browse/${listing.id}`}>
                    {listing.title}
                  </Link>
                </div>
              ))
            )}
          </section>
        )}

        {isOwnProfile && (
          <section>
            <h2>Rentals you can review</h2>

            {reviewable.length === 0 ? (
              <p>No completed rentals waiting for review.</p>
            ) : (
              reviewable.map((rental) => {
                const otherId = getReviewTarget(
                  rental,
                  CURRENT_USER_ID
                )
                const other = getUser(otherId)

                return (
                  <div className="review-card" key={rental.id}>
                    <p>
                      Booking #{rental.id} with {other?.name ?? 'Student'}
                    </p>
                    <Link to={`/bookings/${rental.id}/review`}>
                      Write review
                    </Link>
                  </div>
                )
              })
            )}
          </section>
        )}
      </div>

      <ReviewNavigation />
    </main>
  )
}

export default Reputation