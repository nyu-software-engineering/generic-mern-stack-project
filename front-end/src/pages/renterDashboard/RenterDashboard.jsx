import { useState } from 'react'
import { Link } from 'react-router-dom'
import { rentalStatuses } from '../../data/options.js'
import {
  CURRENT_USER_ID,
  getListings,
  getRentals,
} from '../../services/mockDataService.js'
import { displayStatus as getDisplayStatus, formatDate } from '../../services/bookings'
import {
  getSavedListings,
  unsaveListing,
} from '../../services/savedItems.js'

function formatStatus(status) {
  const label = status.replaceAll('_', ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function RenterDashboard() {
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [savedListings, setSavedListings] = useState(() =>
    getSavedListings(CURRENT_USER_ID),
  )

  function handleUnsave(listingId) {
    unsaveListing(CURRENT_USER_ID, listingId)
    setSavedListings(getSavedListings(CURRENT_USER_ID))
  }

  const listings = getListings()
  const rentals = getRentals().filter(
    (rental) => rental.borrowerId === CURRENT_USER_ID,
  )

  const now = new Date()
  const today =
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, '0')}-` +
    `${String(now.getDate()).padStart(2, '0')}`

  const visibleRentals = rentals.filter(
    (rental) =>
      selectedStatus === 'all' ||
      getDisplayStatus(rental, today) === selectedStatus,
  )

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>My Rentals</h1>
          <p>Track your rental requests and borrowed items.</p>
          <Link to="/browse">Browse items</Link>
        </div>
      </header>

      <div className="filters">
        <label htmlFor="rental-status">Rental status</label>
        <select
          id="rental-status"
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          <option value="all">All</option>
          {[...rentalStatuses, 'overdue'].map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
      </div>

      <p aria-live="polite">
        {visibleRentals.length} rentals found
      </p>

      {visibleRentals.length === 0 ? (
        <p>
          {rentals.length === 0
            ? 'You have no rentals yet. Browse items to get started.'
            : 'No rentals match this status.'}
        </p>
      ) : (
        <section className="rental-grid" aria-label="Your rentals">
          {visibleRentals.map((rental) => {
            const listing = listings.find(
              (item) => item.id === rental.listingId,
            )

            return (
              <article className="rental-card" key={rental.id}>
                <div>
                  <h2>{listing?.title ?? 'Listing unavailable'}</h2>
                  <p>
                    {formatDate(rental.startDate)} –{' '}
                    {formatDate(rental.endDate)}
                  </p>
                  <p>Total: ${rental.totalPrice.toFixed(2)}</p>
                  <Link to={`/bookings/${rental.id}`}>
                    View booking
                  </Link>
                </div>
                <span className="rental-status">
                  {formatStatus(getDisplayStatus(rental, today))}
                </span>
              </article>
            )
          })}
        </section>
      )}
          <section aria-labelledby="saved-items-heading">
        <h2 id="saved-items-heading">Saved items</h2>

        {savedListings.length === 0 ? (
          <p>No saved items yet. Browse items to save something for later.</p>
        ) : (
          <div className="listing-grid">
            {savedListings.map((listing) => (
              <article className="listing-card" key={listing.id}>
                <div>
                  <h3>
                    <Link to={`/browse/${listing.id}`}>
                      {listing.title}
                    </Link>
                  </h3>
                  <p>{listing.category}</p>
                  <p>${listing.price.toFixed(2)} per day</p>
                </div>
                <div className="listing-actions">
                  <button
                    type="button"
                    onClick={() => handleUnsave(listing.id)}
                    aria-label={`Unsave ${listing.title}`}
                  >
                    Unsave
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default RenterDashboard