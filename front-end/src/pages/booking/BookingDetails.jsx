
import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import BookingLoadState from './BookingLoadState'
import ListingSummary from './ListingSummary'
import { useBooking } from './useBooking'
import {
  CURRENT_USER_ID,
  canCancel,
  canConfirmPickup,
  canConfirmReturn,
  dailyRate,
  displayStatus,
  formatDate,
  formatMoney,
  getListing,
  getUser,
} from '../../services/bookings'
import { answerBookingRequest } from '../../services/bookingsApi'
import {
  getReviewForBooking,
  getReviewTarget,
} from '../../services/reviews.js'
import './booking.css'
import './booking-nyu.css'

const AGREED_STATUSES = [
  'confirmed',
  'active',
  'extension_requested',
  'completed',
]

const HANDOFF_VIEW_STATUSES = [
  'active',
  'extension_requested',
  'completed',
]

function BookingDetails() {
  const { bookingId } = useParams()

  return <BookingSummary key={bookingId} bookingId={bookingId} />
}

function BookingSummary({ bookingId }) {
  const { currentUser } = useContext(AuthContext)
  const { booking, loadError, retry, pending, actionError, run } =
    useBooking(bookingId)

  const [agreed, setAgreed] = useState(false)
  const [reviewAvailability, setReviewAvailability] = useState({
    bookingId: null,
    reviewerId: null,
    available: false,
  })

  const reviewerId = currentUser?.id

  useEffect(() => {
    if (
      !booking ||
      !reviewerId ||
      !getReviewTarget(booking, reviewerId)
    ) {
      return undefined
    }

    let active = true

    getReviewForBooking(booking.id).then(
      (existingReview) => {
        if (!active) return

        setReviewAvailability({
          bookingId: booking.id,
          reviewerId,
          available: !existingReview,
        })
      },
      () => {
        if (!active) return

        setReviewAvailability({
          bookingId: booking.id,
          reviewerId,
          available: false,
        })
      }
    )

    return () => { active = false }
  }, [booking, reviewerId])

  if (!booking) {
    return <BookingLoadState loadError={loadError} retry={retry} />
  }

  const listing = getListing(booking.listingId)
  const rentalTerms = booking.terms?.rentalTerms ?? listing?.rentalTerms
  const isOwner = booking.ownerId === CURRENT_USER_ID
  const other = getUser(
    isOwner ? booking.borrowerId : booking.ownerId
  )

  const canRespond =
    isOwner && booking.status === 'requested'

  const canWriteReview =
    Boolean(getReviewTarget(booking, reviewerId)) &&
    String(reviewAvailability.bookingId) === String(booking.id) &&
    reviewAvailability.reviewerId === reviewerId &&
    reviewAvailability.available

  const respond = (status) =>
    run(() => answerBookingRequest(booking.id, status))

  return (
    <main className="ds-page booking-page ds-booking">
      <h1 className="ds-heading">Booking summary</h1>

      {booking.status === 'cancelled' && (
        <p className="booking-alert">
          This booking was cancelled.
        </p>
      )}

      {displayStatus(booking) === 'overdue' && (
        <p className="booking-alert">
          Overdue: this item was due back on{' '}
          {formatDate(booking.endDate)}.{' '}
          {isOwner
            ? 'Message the borrower to arrange the return.'
            : 'Please return it or request an extension.'}
        </p>
      )}

      {listing ? (
        <ListingSummary
          listing={listing}
          detail={`Owner: ${getUser(listing.ownerId)?.name ?? 'Unknown'}`}
        />
      ) : (
        <div className="booking-card">
          <h2>{booking.listingTitle ?? 'Listing unavailable'}</h2>
        </div>
      )}

      <div className="booking-card">
        <div>
          <StatusBadge status={displayStatus(booking)} />
        </div>

        <dl className="booking-facts">
          <div>
            <dt>Daily rate</dt>
            <dd>{formatMoney(dailyRate(booking))}</dd>
          </div>
          <div>
            <dt>Pickup date</dt>
            <dd>{formatDate(booking.startDate)}</dd>
          </div>
          <div>
            <dt>Return date</dt>
            <dd>{formatDate(booking.endDate)}</dd>
          </div>
          <div>
            <dt>
              {AGREED_STATUSES.includes(booking.status)
                ? 'Agreed'
                : 'Proposed'} total
            </dt>
            <dd>{formatMoney(booking.totalPrice)}</dd>
          </div>
          <div>
            <dt>{isOwner ? 'Borrower' : 'Owner'}</dt>
            <dd>{other?.name}</dd>
          </div>
        </dl>

        {booking.terms?.message && (
          <p>Message: “{booking.terms.message}”</p>
        )}
      </div>

      {(listing?.description || rentalTerms) && (
        <div className="booking-card">
          <h2>Condition and included items</h2>
          {listing?.description && <p>{listing.description}</p>}
          {rentalTerms && <p>{rentalTerms}</p>}
        </div>
      )}

      <div className="booking-card">
        <h2>Basic rental agreement</h2>
        <p>Return at the agreed time and condition.</p>
        <p>Contact the other student if plans change.</p>
        <p>Report damage or missing items.</p>
      </div>

      <p className="booking-note">
        Payment is arranged outside DormShare.
      </p>

      {actionError && (
        <p className="field-error" role="alert">
          Could not update this booking. {actionError.message}
        </p>
      )}

      <div className="booking-actions" aria-busy={pending}>
        {canRespond && (
          <>
            <label className="booking-check">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
              />
              I confirm these booking terms
            </label>
            <button
              type="button"
              className="ds-button ds-button--primary"
              disabled={!agreed || pending}
              onClick={() => respond('confirmed')}
            >
              {pending ? 'Saving...' : 'Confirm booking'}
            </button>
          </>
        )}

        {!isOwner && booking.status === 'requested' && (
          <p className="booking-note">
            Waiting for {other?.name} to respond.
          </p>
        )}

        {!isOwner && booking.status === 'active' && (
          <Link
            to={`/bookings/${booking.id}/extension`}
            className="ds-button ds-button--secondary"
          >
            Request extension
          </Link>
        )}

        {booking.status === 'extension_requested' && (
          <Link
            to={`/bookings/${booking.id}/extension`}
            className="ds-button ds-button--secondary"
          >
            {isOwner
              ? 'Review extension request'
              : 'View extension request'}
          </Link>
        )}

        {canConfirmPickup(booking, CURRENT_USER_ID) && (
          <Link
            to={`/handoff/${booking.id}`}
            className="ds-button ds-button--primary"
          >
            Confirm pickup
          </Link>
        )}

        {canConfirmReturn(booking, CURRENT_USER_ID) && (
          <Link
            to={`/handoff/${booking.id}`}
            className="ds-button ds-button--primary"
          >
            Confirm return
          </Link>
        )}

        {HANDOFF_VIEW_STATUSES.includes(booking.status) &&
          !canConfirmReturn(booking, CURRENT_USER_ID) && (
            <Link
              to={`/handoff/${booking.id}`}
              className="ds-button ds-button--secondary"
            >
              View pickup and return checks
            </Link>
          )}

        {canWriteReview && (
          <Link
            to={`/bookings/${booking.id}/review`}
            className="ds-button ds-button--primary"
          >
            Write review
          </Link>
        )}

        <Link
          to="/inbox"
          className="ds-button ds-button--secondary"
        >
          Message {isOwner ? 'borrower' : 'owner'}
        </Link>

        {canCancel(booking, CURRENT_USER_ID) && (
          <Link
            to={`/bookings/${booking.id}/cancel`}
            className="ds-button booking-danger"
          >
            {booking.status === 'requested'
              ? 'Withdraw request'
              : 'Cancel booking'}
          </Link>
        )}

        <Link
          to={`/report?rentalId=${booking.id}`}
          className="ds-button booking-danger"
        >
          Report a problem
        </Link>

        {canRespond && (
          <button
            type="button"
            className="ds-button booking-danger"
            disabled={pending}
            onClick={() => respond('declined')}
          >
            Decline request
          </button>
        )}
      </div>
    </main>
  )
}

export default BookingDetails