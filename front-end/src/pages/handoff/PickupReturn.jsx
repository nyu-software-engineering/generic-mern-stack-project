import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import ListingSummary from '../booking/ListingSummary'
import HandoffCheckForm from './HandoffCheckForm'
import {
  CURRENT_USER_ID, canConfirmPickup, canConfirmReturn, confirmPickup, confirmReturn,
  displayStatus, formatDate, getBooking, getListing, getUser,
} from '../../services/bookings'
import { getReviewForBooking, getReviewTarget } from '../../services/reviews.js'
import '../booking/booking.css'
import './handoff.css'

// Pickup and return (#54): the borrower confirms pickup, the owner confirms return.
// Keyed by rentalId so its state resets when the route moves to another rental.
function PickupReturn() {
  const { rentalId } = useParams()
  return <Handoff key={rentalId} rentalId={rentalId} />
}

function CheckSummary({ title, check }) {
  if (!check) return null
  return (
    <div className="booking-card">
      <h2>{title}</h2>
      <p>Condition: {check.condition}</p>
      <p>Accessories: {check.accessoriesComplete ? 'All included' : 'Something missing'}</p>
      {check.notes && <p>Notes: {check.notes}</p>}
      <p>Confirmed by {getUser(check.confirmedBy)?.name ?? check.confirmedBy} on{' '}
        {formatDate(check.confirmedAt.slice(0, 10))}</p>
    </div>
  )
}

function Handoff({ rentalId }) {
  const [booking, setBooking] = useState(() => getBooking(rentalId))

  if (!booking) return <main className="booking-page"><p>Booking not found.</p></main>

  const listing = getListing(booking.listingId)
  const isOwner = booking.ownerId === CURRENT_USER_ID
  const other = getUser(isOwner ? booking.borrowerId : booking.ownerId)
  const canWriteReview = Boolean(getReviewTarget(booking, CURRENT_USER_ID)) &&
    !getReviewForBooking(booking.id, CURRENT_USER_ID)

  let title = 'Pickup and return'
  let body
  if (canConfirmPickup(booking, CURRENT_USER_ID)) {
    title = 'Confirm pickup'
    body = (
      <HandoffCheckForm
        conditionLabel="Condition of the item you received"
        accessoriesLabel="I received all included accessories"
        submitLabel="Confirm pickup"
        onSubmit={(checks) => setBooking(confirmPickup(booking.id, CURRENT_USER_ID, checks))}
      />
    )
  } else if (canConfirmReturn(booking, CURRENT_USER_ID)) {
    title = 'Confirm return'
    body = (
      <>
        <CheckSummary title="Pickup check" check={booking.pickupCheck} />
        <HandoffCheckForm
          conditionLabel="Condition of the item returned"
          accessoriesLabel="All accessories were returned"
          submitLabel="Confirm return"
          onSubmit={(checks) => setBooking(confirmReturn(booking.id, CURRENT_USER_ID, checks))}
        />
      </>
    )
  } else if (booking.status === 'completed') {
    title = 'Rental complete'
    body = (
      <>
        <p className="booking-note">
          This rental is complete.
          {booking.returnCheck && ` The item was returned on ${formatDate(booking.returnCheck.confirmedAt.slice(0, 10))}.`}
        </p>
        <CheckSummary title="Pickup check" check={booking.pickupCheck} />
        <CheckSummary title="Return check" check={booking.returnCheck} />
        {canWriteReview && (
          <Link to={`/bookings/${booking.id}/review`} className="booking-btn booking-btn--primary">
            Write review
          </Link>
        )}
      </>
    )
  } else if (booking.status === 'confirmed') {
    body = (
      <p className="booking-note">
        {isOwner
          ? `Waiting for ${other?.name} to confirm pickup.`
          : 'Only the borrower can confirm pickup.'}
      </p>
    )
  } else if (['active', 'extension_requested'].includes(booking.status)) {
    body = (
      <>
        <p className="booking-note">
          {isOwner
            ? 'Return can be confirmed once the item is back and no extension request is pending.'
            : `Rental in progress. Return the item to ${other?.name} by ${formatDate(booking.endDate)}.`}
        </p>
        <CheckSummary title="Pickup check" check={booking.pickupCheck} />
      </>
    )
  } else {
    body = <p className="booking-note">Pickup and return are available once a booking is confirmed.</p>
  }

  return (
    <main className="booking-page">
      <h1>{title}</h1>
      {listing && <ListingSummary listing={listing} />}
      <div className="booking-card">
        <div><StatusBadge status={displayStatus(booking)} /></div>
        <p>{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</p>
        <p>{isOwner ? 'Borrower' : 'Owner'}: {other?.name}</p>
      </div>
      {body}
      <p style={{ marginTop: 16 }}>
        <Link to={`/bookings/${booking.id}`}>Back to booking summary</Link>
      </p>
    </main>
  )
}

export default PickupReturn
