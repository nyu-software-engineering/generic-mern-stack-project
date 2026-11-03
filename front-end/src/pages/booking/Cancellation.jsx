import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import ListingSummary from './ListingSummary'
import {
  CURRENT_USER_ID, cancelBooking, canCancel, formatDate, formatMoney, getBooking, getListing, getUser,
} from '../../services/bookings'
import './booking.css'

// Why a booking can't be cancelled, worded for its current status.
function cannotCancelReason(booking, isOwner) {
  switch (booking.status) {
    case 'requested':
      return isOwner
        ? 'To turn down a request, decline it from Incoming rental requests.'
        : 'Only the borrower can withdraw this request.'
    case 'declined':
      return 'This request was declined, so there is nothing to cancel.'
    case 'completed':
      return 'This rental is completed. The item was already returned.'
    case 'active':
    case 'extension_requested':
      return 'This item has already been picked up, so the booking can no longer be cancelled. Use the return flow or message the other student.'
    default:
      return 'This booking can no longer be cancelled.'
  }
}

// Cancellation confirmation (#56). Keyed so state resets on a new booking id.
function Cancellation() {
  const { bookingId } = useParams()
  return <CancelPage key={bookingId} bookingId={bookingId} />
}

function CancelPage({ bookingId }) {
  const [booking, setBooking] = useState(() => getBooking(bookingId))

  if (!booking) return <main className="booking-page"><p>Booking not found.</p></main>

  const listing = getListing(booking.listingId)
  const isOwner = booking.ownerId === CURRENT_USER_ID
  const other = getUser(isOwner ? booking.borrowerId : booking.ownerId)
  const allowed = canCancel(booking, CURRENT_USER_ID)
  const isRequest = booking.status === 'requested'

  let body
  if (booking.status === 'cancelled') {
    body = (
      <div className="booking-card">
        <h2>Booking cancelled</h2>
        <p>This booking is now cancelled for you and {other?.name}.</p>
      </div>
    )
  } else if (allowed) {
    body = (
      <>
        <div className="booking-card">
          <h2>{isRequest ? 'Withdraw this request?' : 'Cancel this booking?'}</h2>
          <p>
            {isRequest
              ? `Your request to ${other?.name} will be withdrawn.`
              : `The booking with ${other?.name} for ${formatDate(booking.startDate)} – ${formatDate(booking.endDate)} will be marked as cancelled for both of you.`}
          </p>
          <p>This can&apos;t be undone.</p>
        </div>
        <div className="booking-actions">
          <button
            type="button"
            className="booking-btn booking-btn--danger"
            onClick={() => setBooking(cancelBooking(booking.id, CURRENT_USER_ID))}
          >
            {isRequest ? 'Yes, withdraw request' : 'Yes, cancel booking'}
          </button>
          <Link to={`/bookings/${booking.id}`} className="booking-btn">Keep booking</Link>
        </div>
      </>
    )
  } else {
    body = <p className="booking-note">{cannotCancelReason(booking, isOwner)}</p>
  }

  return (
    <main className="booking-page">
      <h1>Cancel booking</h1>
      {listing && <ListingSummary listing={listing} />}
      <div className="booking-card">
        <div><StatusBadge status={booking.status} /></div>
        <p>{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</p>
        <p>Total: {formatMoney(booking.totalPrice)}</p>
      </div>
      {body}
      <p style={{ marginTop: 16 }}>
        <Link to={`/bookings/${booking.id}`}>Back to booking summary</Link>
      </p>
    </main>
  )
}

export default Cancellation
