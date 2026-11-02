import { useState } from 'react'
import { Link } from 'react-router-dom'
import { rentalStatuses } from '../../data/options.js'
import {
  CURRENT_USER_ID,
  getListings,
  getRentalsForOwner,
} from '../../services/mockDataService.js'

function formatStatus(status) {
  return status.replace(/_/g, ' ')
}

function OwnerDashboard() {
  const [rentalSearch, setRentalSearch] = useState('')
  const [rentalStatus, setRentalStatus] = useState('all')
  const rentals = getRentalsForOwner(CURRENT_USER_ID)
  const listings = getListings()

  const visibleRentals = rentals.filter((rental) => {
    const listing = listings.find((item) => item.id === rental.listingId)
    const matchesStatus =
      rentalStatus === 'all' || rental.status === rentalStatus
    const searchText =
      `${listing?.title ?? ''} ${rental.borrowerId}`.toLowerCase()
    const matchesSearch = searchText.includes(rentalSearch.trim().toLowerCase())

    return matchesStatus && matchesSearch
  })

  const activeRentals = rentals.filter(
    (rental) => rental.status === 'active',
  ).length

  const recordedIncome = rentals
    .filter((rental) => rental.status === 'completed')
    .reduce((total, rental) => total + rental.totalPrice, 0)

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Owner Dashboard</h1>
          <p>Review rental activity and recorded income.</p>
          <Link to="/listings">Manage listings</Link>
        </div>
      </header>

      <section className="summary">
        <article>
          <span>Total rentals</span>
          <strong>{rentals.length}</strong>
        </article>
        <article>
          <span>Active rentals</span>
          <strong>{activeRentals}</strong>
        </article>
        <article>
          <span>Recorded income</span>
          <strong>${recordedIncome.toFixed(2)}</strong>
        </article>
      </section>

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

        {visibleRentals.length === 0 ? (
          <p>No rentals match your search.</p>
        ) : (
          <div className="rental-grid">
            {visibleRentals.map((rental) => {
              const listing = listings.find(
                (item) => item.id === rental.listingId,
              )

              return (
                <article className="rental-card" key={rental.id}>
                  <div>
                    <h3>{listing?.title ?? 'Listing unavailable'}</h3>
                    <p>Borrower: {rental.borrowerId}</p>
                    <p>
                      {rental.startDate} to {rental.endDate}
                    </p>
                    <p>Total: ${rental.totalPrice.toFixed(2)}</p>
                  </div>
                  <span className="rental-status">
                    {formatStatus(rental.status)}
                  </span>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default OwnerDashboard
