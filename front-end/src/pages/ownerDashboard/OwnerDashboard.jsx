import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge.jsx'
import { rentalStatuses } from '../../data/options.js'
import { getOwnerDashboard } from '../../services/ownerDashboard.js'
import '../../styles/management.css'

function formatStatus(status) {
  return status.replace(/_/g, ' ')
}

function OwnerDashboard() {
  const [rentalSearch, setRentalSearch] = useState('')
  const [rentalStatus, setRentalStatus] = useState('all')
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    getOwnerDashboard({ search: rentalSearch, status: rentalStatus }).then(
      (result) => {
        if (!current) return
        setDashboard(result)
        setLoading(false)
      },
      (loadError) => {
        if (!current) return
        setError(loadError.message)
        setLoading(false)
      },
    )
    return () => { current = false }
  }, [rentalSearch, rentalStatus, attempt])

  const rentals = dashboard?.rentals ?? []
  const hasFilters = rentalSearch !== '' || rentalStatus !== 'all'

  return (
    <main className="ds-page ds-management">
      <header className="ds-management-header">
        <div className="ds-page-intro">
          <h1 className="ds-heading">Owner Dashboard</h1>
          <p>Review rental activity and recorded income.</p>
        </div>
        <Link className="ds-button ds-button--primary" to="/listings">Manage listings</Link>
      </header>

      {dashboard && <section className="ds-management-summary" aria-label="Rental summary">
        <article>
          <span>Total rentals</span>
          <strong>{dashboard.summary.totalRentals}</strong>
        </article>
        <article>
          <span>Active rentals</span>
          <strong>{dashboard.summary.activeRentals}</strong>
        </article>
        <article>
          <span>Recorded income</span>
          <strong>${dashboard.summary.recordedIncome.toFixed(2)}</strong>
        </article>
      </section>}

      <section className="ds-management-section" aria-labelledby="owner-rental-activity-heading">
        <h2 id="owner-rental-activity-heading">Rental activity</h2>

        <div className="ds-management-filters">
          <label>
            Search rentals
            <input
              className="ds-field"
              placeholder="Search by item or borrower"
              value={rentalSearch}
              onChange={(event) => {
                setRentalSearch(event.target.value)
                setLoading(true)
                setError('')
              }}
            />
          </label>
          <label>
            Rental status
            <select
              className="ds-field"
              value={rentalStatus}
              onChange={(event) => {
                setRentalStatus(event.target.value)
                setLoading(true)
                setError('')
              }}
            >
              <option value="all">All</option>
              {rentalStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </label>
          {hasFilters && <button className="ds-button ds-button--secondary" type="button" onClick={() => {
            setRentalSearch('')
            setRentalStatus('all')
            setLoading(true)
            setError('')
          }}>Clear filters</button>}
        </div>

        {loading && <p className="ds-status" role="status">Loading rental activity...</p>}
        {error && <div className="ds-feedback ds-feedback--error" role="alert">
          <p>{error}</p>
          <button className="ds-button ds-button--secondary" type="button" onClick={() => {
            setError('')
            setLoading(true)
            setAttempt((current) => current + 1)
          }}>Try again</button>
        </div>}

        {!loading && !error && <>
          <p className="ds-management-meta" aria-live="polite">{rentals.length} {rentals.length === 1 ? 'rental' : 'rentals'} found</p>
          {rentals.length === 0 ? (
            <div className="ds-management-empty">
              <h3>{hasFilters ? 'No rentals match your filters' : 'No rental activity yet'}</h3>
              <p>{hasFilters
                ? 'Try another item, borrower, or rental status.'
                : 'Rental activity will appear here when someone requests one of your items.'}</p>
              {!hasFilters && <Link className="ds-text-link" to="/listings">Manage listings</Link>}
            </div>
          ) : (
            <div className="ds-management-list">
              {rentals.map((rental) => (
                <article className="ds-management-row" key={rental.id}>
                  <div>
                    <h3>{rental.listingTitle}</h3>
                    <p>Borrower: {rental.borrowerName}</p>
                    <p className="ds-management-meta">{rental.startDate} to {rental.endDate}</p>
                    <p>Total: ${rental.totalPrice.toFixed(2)}</p>
                  </div>
                  <StatusBadge status={rental.status} />
                  <Link className="ds-text-link" to={`/bookings/${rental.id}`}>View booking</Link>
                </article>
              ))}
            </div>
          )}
        </>}
      </section>
    </main>
  )
}

export default OwnerDashboard
