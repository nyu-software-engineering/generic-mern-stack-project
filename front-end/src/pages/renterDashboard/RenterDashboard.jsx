import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SaveListingButton, { SavedItemsStatus } from '../../components/SaveListingButton.jsx'
import { SavedItemsContext } from '../../context/SavedItemsContext.js'
import { rentalStatuses } from '../../data/options.js'
import { displayStatus, formatDate } from '../../services/bookings'
import { getMyRentals } from '../../services/renterDashboard.js'

function formatStatus(status) {
  const label = status.replaceAll('_', ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function RentalActivity() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    getMyRentals().then(
      (rentals) => { if (current) setResult({ rentals }) },
      (error) => { if (current) setResult({ error }) },
    )
    return () => { current = false }
  }, [attempt])

  if (!result) return <p role="status">Loading rentals...</p>

  if (result.error) {
    return (
      <div>
        <p role="alert">Could not load rentals. {result.error.message}</p>
        <button type="button" onClick={() => {
          setResult(null)
          setAttempt((value) => value + 1)
        }}>Retry rentals</button>
      </div>
    )
  }

  const { rentals } = result
  const visibleRentals = rentals.filter(
    (rental) => selectedStatus === 'all' || displayStatus(rental) === selectedStatus,
  )

  return (
    <>
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

      <p aria-live="polite">{visibleRentals.length} rentals found</p>

      {visibleRentals.length === 0 ? (
        <p>
          {rentals.length === 0
            ? 'You have no rentals yet. Browse items to get started.'
            : 'No rentals match this status.'}
        </p>
      ) : (
        <section className="rental-grid" aria-label="Your rentals">
          {visibleRentals.map((rental) => (
            <article className="rental-card" key={rental.id}>
              <div>
                <h2>{rental.listingTitle}</h2>
                <p>{formatDate(rental.startDate)} – {formatDate(rental.endDate)}</p>
                <p>Total: ${rental.totalPrice.toFixed(2)}</p>
                <Link to={`/bookings/${rental.id}`}>View booking</Link>
              </div>
              <span className="rental-status">{formatStatus(displayStatus(rental))}</span>
            </article>
          ))}
        </section>
      )}
    </>
  )
}

function RenterDashboard() {
  const { savedListings } = useContext(SavedItemsContext)

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>My Rentals</h1>
          <p>Track your rental requests and borrowed items.</p>
          <Link to="/browse">Browse items</Link>
        </div>
      </header>

      <RentalActivity />

      <section aria-labelledby="saved-items-heading">
        <h2 id="saved-items-heading">Saved items</h2>
        <SavedItemsStatus />

        {savedListings?.length === 0 && (
          <p>No saved items yet. Browse items to save something for later.</p>
        )}

        {savedListings?.length > 0 && (
          <div className="listing-grid">
            {savedListings.map((listing) => (
              <article className="listing-card" key={listing.id}>
                <div>
                  <h3><Link to={`/browse/${listing.id}`}>{listing.title}</Link></h3>
                  <p>{listing.category}</p>
                  <p>${listing.price.toFixed(2)} per day</p>
                </div>
                <div className="listing-actions">
                  <SaveListingButton listing={listing} compact />
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
