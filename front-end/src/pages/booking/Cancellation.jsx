import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import BookingLoadState from './BookingLoadState'
import ListingSummary from './ListingSummary'
import { useBooking } from './useBooking'
import {
  CURRENT_USER_ID, canCancel, dailyRate, formatDate, formatMoney, getListing, getUser,
} from '../../services/bookings'
import { cancelBookingRequest } from '../../services/bookingsApi'
import './booking.css'
import './booking-nyu.css'

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
  const { booking, loadError, retry, pending, actionError, run } = useBooking(bookingId)

  if (!booking) return <BookingLoadState loadError={loadError} retry={retry} />

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
              : `The booking with ${other?.name} for ${formatDate(booking.startDate)} to ${formatDate(booking.endDate)} will be marked as cancelled for both of you.`}
          </p>
          <p>This can&apos;t be undone.</p>
        </div>
        {actionError && (
          <p className="field-error" role="alert">Could not cancel. {actionError.message}</p>
        )}
        <div className="booking-actions" aria-busy={pending}>
          <button
            type="button"
            className="ds-button booking-danger"
            disabled={pending}
            onClick={() => run(() => cancelBookingRequest(booking.id))}
          >
            {pending ? 'Cancelling...' : isRequest ? 'Yes, withdraw request' : 'Yes, cancel booking'}
          </button>
          <Link to={`/bookings/${booking.id}`} className="ds-button ds-button--secondary">Keep booking</Link>
        </div>
      </>
    )
  } else {
    body = <p className="booking-note">{cannotCancelReason(booking, isOwner)}</p>
  }

  return (
    <main className="ds-page booking-page ds-booking">
      <h1 className="ds-heading">Cancel booking</h1>
      {listing && <ListingSummary listing={listing} detail={`Owner: ${getUser(listing.ownerId)?.name ?? 'Unknown'}`} />}
      <div className="booking-card">
        <div><StatusBadge status={booking.status} /></div>
        <dl className="booking-facts">
          <div><dt>Daily rate</dt><dd>{formatMoney(dailyRate(booking))}</dd></div>
          <div><dt>Pickup date</dt><dd>{formatDate(booking.startDate)}</dd></div>
          <div><dt>Return date</dt><dd>{formatDate(booking.endDate)}</dd></div>
          <div><dt>Total</dt><dd>{formatMoney(booking.totalPrice)}</dd></div>
        </dl>
      </div>
      {body}
      <p style={{ marginTop: 16 }}>
        <Link className="ds-text-link" to={`/bookings/${booking.id}`}>Back to booking summary</Link>
      </p>
    </main>
  )
}

export default Cancellation
