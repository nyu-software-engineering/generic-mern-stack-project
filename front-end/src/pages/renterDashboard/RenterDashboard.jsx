import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SaveListingButton, { SavedItemsStatus } from '../../components/SaveListingButton.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { SavedItemsContext } from '../../context/SavedItemsContext.js'
import { rentalStatuses } from '../../data/options.js'
import { displayStatus, formatDate } from '../../services/bookings'
import { getMyRentals } from '../../services/renterDashboard.js'
import '../../styles/management.css'

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

  if (!result) return <p className="ds-status" role="status">Loading rentals...</p>

  if (result.error) {
    return (
      <div className="ds-feedback ds-feedback--error">
        <p role="alert">Could not load rentals. {result.error.message}</p>
        <button className="ds-button ds-button--secondary" type="button" onClick={() => {
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
      <div className="ds-management-filters">
        <label>
          Rental status
          <select
            className="ds-field"
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
        </label>
        {selectedStatus !== 'all' && <button
          className="ds-button ds-button--secondary"
          type="button"
          onClick={() => setSelectedStatus('all')}
        >Clear filter</button>}
      </div>

      <p className="ds-management-meta" aria-live="polite">{visibleRentals.length} {visibleRentals.length === 1 ? 'rental' : 'rentals'} found</p>

      {visibleRentals.length === 0 ? (
        <div className="ds-management-empty">
          <h3>{rentals.length === 0 ? 'No rentals yet' : 'No rentals match this status'}</h3>
          <p>{rentals.length === 0
            ? 'Browse items to find something you need.'
            : 'Choose another rental status or clear the filter.'}</p>
          {rentals.length === 0 && <Link className="ds-text-link" to="/browse">Browse items</Link>}
        </div>
      ) : (
        <div className="ds-management-list">
          {visibleRentals.map((rental) => (
            <article className="ds-management-row" key={rental.id}>
              <div>
                <h3>{rental.listingTitle}</h3>
                <p className="ds-management-meta">{formatDate(rental.startDate)} to {formatDate(rental.endDate)}</p>
                <p>Total: ${rental.totalPrice.toFixed(2)}</p>
              </div>
              <StatusBadge status={displayStatus(rental)} />
              <Link className="ds-text-link" to={`/bookings/${rental.id}`}>View booking</Link>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

function RenterDashboard() {
  const { savedListings } = useContext(SavedItemsContext)

  return (
    <main className="ds-page ds-management">
      <header className="ds-management-header">
        <div className="ds-page-intro">
          <h1 className="ds-heading">My Rentals</h1>
          <p>Track your rental requests and borrowed items.</p>
        </div>
        <Link className="ds-button ds-button--primary" to="/browse">Browse items</Link>
      </header>

      <section className="ds-management-section" aria-labelledby="renter-rental-activity-heading">
        <h2 id="renter-rental-activity-heading">Rental activity</h2>
        <RentalActivity />
      </section>

      <section className="ds-management-section" aria-labelledby="saved-items-heading">
        <h2 id="saved-items-heading">Saved items</h2>
        <SavedItemsStatus />

        {savedListings?.length === 0 && (
          <div className="ds-management-empty">
            <h3>No saved items yet</h3>
            <p>Save items while you browse to find them here later.</p>
            <Link className="ds-text-link" to="/browse">Browse items</Link>
          </div>
        )}

        {savedListings?.length > 0 && <>
          <p className="ds-management-meta" aria-live="polite">{savedListings.length} saved {savedListings.length === 1 ? 'item' : 'items'}</p>
          <div className="ds-management-list">
            {savedListings.map((listing) => (
              <article className="ds-management-row" key={listing.id}>
                <div>
                  <h3><Link className="ds-text-link" to={`/browse/${listing.id}`}>{listing.title}</Link></h3>
                  <p className="ds-management-meta">{listing.category}</p>
                  <p>${listing.price.toFixed(2)} per day</p>
                </div>
                <div className="ds-management-actions">
                  <SaveListingButton listing={listing} compact />
                </div>
              </article>
            ))}
          </div>
        </>}
      </section>
    </main>
  )
}

export default RenterDashboard
