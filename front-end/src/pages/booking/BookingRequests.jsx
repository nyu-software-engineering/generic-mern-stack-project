import { useState } from 'react'
import { Link } from 'react-router-dom'
import RequestCard from './RequestCard'
import {
  CURRENT_USER_ID, formatDate, getExtensionRequests, getIncomingRequests, getListing, getUser,
  updateBookingStatus,
} from '../../services/bookings'
import './booking.css'

// Owner's incoming rental requests (prototype m22).
function BookingRequests() {
  const [requests, setRequests] = useState(() => getIncomingRequests(CURRENT_USER_ID))
  const extensions = getExtensionRequests(CURRENT_USER_ID)

  const handleDecline = (id) => {
    updateBookingStatus(id, 'declined')
    setRequests(getIncomingRequests(CURRENT_USER_ID))
  }

  return (
    <main className="booking-page">
      <h1>Incoming rental requests</h1>
      {requests.length === 0 ? (
        <p className="booking-empty">No pending requests.</p>
      ) : (
        requests.map((b) => <RequestCard key={b.id} booking={b} onDecline={handleDecline} />)
      )}

      {extensions.length > 0 && (
        <>
          <h1 style={{ marginTop: 32 }}>Extension requests</h1>
          {extensions.map((b) => (
            <Link key={b.id} to={`/bookings/${b.id}/extension`} className="booking-card" style={{ textDecoration: 'none' }}>
              <h2>{getListing(b.listingId)?.title}</h2>
              <p>
                {getUser(b.borrowerId)?.name} wants to return on {formatDate(b.extensionRequest.newEndDate)}
                {' '}instead of {formatDate(b.endDate)}
              </p>
            </Link>
          ))}
        </>
      )}
    </main>
  )
}

export default BookingRequests
