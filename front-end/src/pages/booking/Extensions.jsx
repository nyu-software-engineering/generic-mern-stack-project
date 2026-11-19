import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import BookingLoadState from './BookingLoadState'
import ExtensionRequestForm from './ExtensionRequestForm'
import ListingSummary from './ListingSummary'
import { useBooking } from './useBooking'
import {
  CURRENT_USER_ID, extensionCost, formatDate, formatMoney, getListing, getUser,
} from '../../services/bookings'
import { answerExtensionRequest, sendExtensionRequest } from '../../services/bookingsApi'
import './booking.css'
import './booking-nyu.css'

// Extension requests (#55): the borrower asks for a later return date,
// the owner approves or declines. Keyed so state resets on a new booking id.
function Extensions() {
  const { bookingId } = useParams()
  return <ExtensionPage key={bookingId} bookingId={bookingId} />
}

function ExtensionPage({ bookingId }) {
  const { booking, loadError, retry, pending: saving, actionError, run } = useBooking(bookingId)

  if (!booking) return <BookingLoadState loadError={loadError} retry={retry} />

  const listing = getListing(booking.listingId)
  const isOwner = booking.ownerId === CURRENT_USER_ID
  const isBorrower = booking.borrowerId === CURRENT_USER_ID
  const request = booking.extensionRequest
  const pending = booking.status === 'extension_requested' && request?.status === 'pending'

  const respond = (approve) => run(() => answerExtensionRequest(booking.id, approve))

  let body
  if (pending && isOwner) {
    const extra = extensionCost(booking, request.newEndDate)
    body = (
      <>
        <div className="booking-card">
          <h2>{getUser(booking.borrowerId)?.name} wants to return later</h2>
          <p>Current return: {formatDate(booking.endDate)}</p>
          <p>Requested return: {formatDate(request.newEndDate)}</p>
          <p>Extra cost: {formatMoney(extra)} · New total: {formatMoney(booking.totalPrice + extra)}</p>
        </div>
        <div className="booking-actions" aria-busy={saving}>
          <button type="button" className="ds-button ds-button--primary" disabled={saving}
            onClick={() => respond(true)}>
            {saving ? 'Saving...' : 'Approve extension'}
          </button>
          <Link to="/inbox" className="ds-button ds-button--secondary">Message borrower</Link>
          <button type="button" className="ds-button booking-danger" disabled={saving}
            onClick={() => respond(false)}>
            Decline extension
          </button>
        </div>
      </>
    )
  } else if (pending) {
    body = (
      <p className="booking-note">
        You asked to return on {formatDate(request.newEndDate)}. Waiting for{' '}
        {getUser(booking.ownerId)?.name} to respond.
      </p>
    )
  } else if (booking.status === 'active' && isBorrower) {
    body = (
      <>
        {request?.status === 'approved' && (
          <p className="booking-note">Extension approved. Your new return date is {formatDate(booking.endDate)}.</p>
        )}
        {request?.status === 'declined' && (
          <p className="booking-note">
            Your request to return on {formatDate(request.newEndDate)} was declined. You can ask for a different date.
          </p>
        )}
        <ExtensionRequestForm
          booking={booking}
          submitting={saving}
          onSubmit={(newEndDate) => run(() => sendExtensionRequest(booking.id, newEndDate))}
        />
      </>
    )
  } else {
    body = (
      <p className="booking-note">
        {request?.status === 'approved' && `Extension approved. New return date: ${formatDate(booking.endDate)}. `}
        {request?.status === 'declined' && 'Extension declined. '}
        {booking.status !== 'active' && 'Extensions can only be requested for active rentals.'}
      </p>
    )
  }

  return (
    <main className="ds-page booking-page ds-booking">
      <h1 className="ds-heading">{isOwner ? 'Extension request' : 'Request extension'}</h1>
      {listing && <ListingSummary listing={listing} />}
      <div className="booking-card">
        <div><StatusBadge status={booking.status} /></div>
        <dl className="booking-facts">
          <div><dt>Pickup date</dt><dd>{formatDate(booking.startDate)}</dd></div>
          <div><dt>Return date</dt><dd>{formatDate(booking.endDate)}</dd></div>
          <div><dt>Total</dt><dd>{formatMoney(booking.totalPrice)}</dd></div>
        </dl>
      </div>
      {actionError && (
        <p className="field-error" role="alert">Could not update the extension. {actionError.message}</p>
      )}
      {body}
      <p style={{ marginTop: 16 }}>
        <Link className="ds-text-link" to={`/bookings/${booking.id}`}>Back to booking summary</Link>
      </p>
    </main>
  )
}

export default Extensions
