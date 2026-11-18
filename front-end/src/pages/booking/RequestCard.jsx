import { Link } from 'react-router-dom'
import ListingSummary from './ListingSummary'
import { formatDate, formatMoney, getListing, getUser } from '../../services/bookings'

// One incoming rental request (prototype m22).
function RequestCard({ booking, onDecline, declining = false, disabled = false }) {
  const listing = getListing(booking.listingId)
  const borrower = getUser(booking.borrowerId)
  const dates = `${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`

  return (
    <article style={{ marginBottom: 24 }}>
      <div className="booking-card">
        <h2>{borrower?.name}</h2>
        <p>Verified NYU · {borrower?.completedRentals ?? 0} completed rentals</p>
        {booking.terms?.message && <p>“{booking.terms.message}”</p>}
      </div>
      {listing ? (
        <ListingSummary listing={listing} detail={`${formatMoney(booking.totalPrice)} offer · ${dates}`} />
      ) : (
        <div className="booking-card">
          <h2>Listing unavailable</h2>
          <p>{formatMoney(booking.totalPrice)} offer · {dates}</p>
        </div>
      )}
      <div className="booking-actions">
        <Link to={`/bookings/${booking.id}`} className="booking-btn booking-btn--primary">
          Accept and review booking
        </Link>
        <Link to="/inbox" className="booking-btn">Message / counter offer</Link>
        <button type="button" className="booking-btn booking-btn--link" disabled={disabled}
          onClick={() => onDecline(booking.id)}>
          {declining ? 'Declining...' : 'Decline request'}
        </button>
      </div>
    </article>
  )
}

export default RequestCard
