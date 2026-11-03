import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import ExtensionRequestForm from './ExtensionRequestForm'
import ListingSummary from './ListingSummary'
import {
  CURRENT_USER_ID, extensionCost, formatDate, formatMoney, getBooking, getListing, getUser,
  requestExtension, respondToExtension,
} from '../../services/bookings'
import './booking.css'

// Extension requests (#55): the borrower asks for a later return date,
// the owner approves or declines. Keyed so state resets on a new booking id.
function Extensions() {
  const { bookingId } = useParams()
  return <ExtensionPage key={bookingId} bookingId={bookingId} />
}

function ExtensionPage({ bookingId }) {
  const [booking, setBooking] = useState(() => getBooking(bookingId))

  if (!booking) return <main className="booking-page"><p>Booking not found.</p></main>

  const listing = getListing(booking.listingId)
  const isOwner = booking.ownerId === CURRENT_USER_ID
  const isBorrower = booking.borrowerId === CURRENT_USER_ID
  const request = booking.extensionRequest
  const pending = booking.status === 'extension_requested' && request?.status === 'pending'

  const respond = (approve) => setBooking(respondToExtension(booking.id, approve))

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
        <div className="booking-actions">
          <button type="button" className="booking-btn booking-btn--primary" onClick={() => respond(true)}>
            Approve extension
          </button>
          <Link to="/inbox" className="booking-btn">Message borrower</Link>
          <button type="button" className="booking-btn booking-btn--link" onClick={() => respond(false)}>
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
          onSubmit={(newEndDate) => setBooking(requestExtension(booking.id, newEndDate))}
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
    <main className="booking-page">
      <h1>{isOwner ? 'Extension request' : 'Request extension'}</h1>
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

export default Extensions
