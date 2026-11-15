import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { rentalStatuses } from '../../data/options.js'
import { getOwnerDashboard } from '../../services/ownerDashboard.js'

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
    getOwnerDashboard().then(
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
  }, [attempt])

  const rentals = dashboard?.rentals ?? []

  const visibleRentals = rentals.filter((rental) => {
    const matchesStatus =
      rentalStatus === 'all' || rental.status === rentalStatus
    const searchText =
      `${rental.listingTitle} ${rental.borrowerName} ${rental.borrowerId}`.toLowerCase()
    const matchesSearch = searchText.includes(rentalSearch.trim().toLowerCase())

    return matchesStatus && matchesSearch
  })

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Owner Dashboard</h1>
          <p>Review rental activity and recorded income.</p>
          <Link to="/listings">Manage listings</Link>
        </div>
      </header>

      {dashboard && <section className="summary">
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

      <section className="rentals-section">
        <h2>Rental activity</h2>

        <div className="filters">
          <input
            aria-label="Search rentals"
            placeholder="Search by item or borrower"
            value={rentalSearch}
            onChange={(event) => setRentalSearch(event.target.value)}
          />
          <select
            aria-label="Filter rentals by status"
            value={rentalStatus}
            onChange={(event) => setRentalStatus(event.target.value)}
          >
            <option value="all">All</option>
            {rentalStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        {loading && <p role="status">Loading rental activity...</p>}
        {error && <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => {
            setError('')
            setLoading(true)
            setAttempt((current) => current + 1)
          }}>Try again</button>
        </div>}

        {!loading && !error && (visibleRentals.length === 0 ? (
          <p>No rentals match your search.</p>
        ) : (
          <div className="rental-grid">
            {visibleRentals.map((rental) => (
                <article className="rental-card" key={rental.id}>
                  <div>
                    <h3>{rental.listingTitle}</h3>
                    <p>Borrower: {rental.borrowerName}</p>
                    <p>
                      {rental.startDate} to {rental.endDate}
                    </p>
                    <p>Total: ${rental.totalPrice.toFixed(2)}</p>
                    <Link to={`/bookings/${rental.id}`}>View booking</Link>
                  </div>
                  <span className="rental-status">
                    {formatStatus(rental.status)}
                  </span>
                </article>
            ))}
          </div>
        ))}
      </section>
    </main>
  )
}

export default OwnerDashboard
