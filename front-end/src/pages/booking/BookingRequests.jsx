import { useState } from 'react'
import RequestCard from './RequestCard'
import { CURRENT_USER_ID, getIncomingRequests, updateBookingStatus } from '../../services/bookings'
import './booking.css'

// Owner's incoming rental requests (prototype m22).
function BookingRequests() {
  const [requests, setRequests] = useState(() => getIncomingRequests(CURRENT_USER_ID))

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
    </main>
  )
}

export default BookingRequests
