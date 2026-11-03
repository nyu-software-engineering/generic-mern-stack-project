import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import ListingSummary from './ListingSummary'
import {
  CURRENT_USER_ID, formatDate, getBooking, getListing, getUser, updateBookingStatus,
} from '../../services/bookings'
import './booking.css'

// Statuses where the owner has accepted, so the price is agreed rather than proposed.
const AGREED_STATUSES = ['confirmed', 'active', 'extension_requested', 'completed']

// Booking summary shared by owner and borrower (prototype m23).
// Keyed by bookingId so its state resets when the route moves to another booking.
function BookingDetails() {
  const { bookingId } = useParams()
  return <BookingSummary key={bookingId} bookingId={bookingId} />
}

function BookingSummary({ bookingId }) {
  const [booking, setBooking] = useState(() => getBooking(bookingId))
  const [agreed, setAgreed] = useState(false)

  if (!booking) return <main className="booking-page"><p>Booking not found.</p></main>

  const listing = getListing(booking.listingId)
  const isOwner = booking.ownerId === CURRENT_USER_ID
  const other = getUser(isOwner ? booking.borrowerId : booking.ownerId)
  const canRespond = isOwner && booking.status === 'requested'

  const respond = (status) => setBooking(updateBookingStatus(booking.id, status))

  return (
    <main className="booking-page">
      <h1>Booking summary</h1>

      <ListingSummary listing={listing} />

      <div className="booking-card">
        <div><StatusBadge status={booking.status} /></div>
        <p>{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</p>
        <p>{AGREED_STATUSES.includes(booking.status) ? 'Agreed' : 'Proposed'} total: ${booking.totalPrice}</p>
        <p>{isOwner ? 'Borrower' : 'Owner'}: {other?.name}</p>
        {booking.terms?.message && <p>Message: “{booking.terms.message}”</p>}
      </div>

      <div className="booking-card">
        <h2>Condition and included items</h2>
        <p>{listing.description}</p>
        <p>{booking.terms?.rentalTerms ?? listing.rentalTerms}</p>
      </div>

      <div className="booking-card">
        <h2>Basic rental agreement</h2>
        <p>Return at the agreed time and condition.</p>
        <p>Contact the other student if plans change.</p>
        <p>Report damage or missing items.</p>
      </div>

      <p className="booking-note">Payment is arranged outside DormShare.</p>

      <div className="booking-actions">
        {canRespond && (
          <>
            <label className="booking-check">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              I confirm these booking terms
            </label>
            <button type="button" className="booking-btn booking-btn--primary"
              disabled={!agreed} onClick={() => respond('confirmed')}>
              Confirm booking
            </button>
          </>
        )}
        {!isOwner && booking.status === 'requested' && (
          <p className="booking-note">Waiting for {other?.name} to respond.</p>
        )}
        {!isOwner && booking.status === 'active' && (
          <Link to={`/bookings/${booking.id}/extension`} className="booking-btn">Request extension</Link>
        )}
        {booking.status === 'extension_requested' && (
          <Link to={`/bookings/${booking.id}/extension`} className="booking-btn">
            {isOwner ? 'Review extension request' : 'View extension request'}
          </Link>
        )}
        <Link to="/inbox" className="booking-btn">Message {isOwner ? 'borrower' : 'owner'}</Link>
        {canRespond && (
          <button type="button" className="booking-btn booking-btn--link" onClick={() => respond('declined')}>
            Decline request
          </button>
        )}
      </div>
    </main>
  )
}

export default BookingDetails
