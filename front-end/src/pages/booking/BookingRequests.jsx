import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RequestCard from './RequestCard'
import { formatDate, getListing, getUser } from '../../services/bookings'
import {
  answerBookingRequest, fetchBookingRequests, fetchExtensionRequests,
} from '../../services/bookingsApi'
import './booking.css'

// Owner's incoming rental requests (prototype m22) and pending extensions (#97).
function BookingRequests() {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [decliningId, setDecliningId] = useState(null)
  const [declineError, setDeclineError] = useState(null)

  useEffect(() => {
    let current = true
    Promise.all([fetchBookingRequests(), fetchExtensionRequests()]).then(
      ([requests, extensions]) => { if (current) setResult({ requests, extensions }) },
      (error) => { if (current) setResult({ error }) },
    )
    return () => { current = false }
  }, [attempt])

  const retry = () => {
    setResult(null)
    setAttempt((value) => value + 1)
  }

  const handleDecline = async (id) => {
    if (decliningId !== null) return
    setDecliningId(id)
    setDeclineError(null)
    try {
      await answerBookingRequest(id, 'declined')
      setResult((current) => ({
        ...current,
        requests: current.requests.filter((booking) => booking.id !== id),
      }))
    } catch (error) {
      setDeclineError(error)
    } finally {
      setDecliningId(null)
    }
  }

  if (!result) {
    return <main className="booking-page"><p role="status">Loading requests...</p></main>
  }
  if (result.error) {
    return (
      <main className="booking-page">
        <h1>Incoming rental requests</h1>
        <p role="alert">Could not load requests. {result.error.message}</p>
        <button type="button" className="booking-btn" onClick={retry}>Retry</button>
      </main>
    )
  }

  const { requests, extensions } = result

  return (
    <main className="booking-page">
      <h1>Incoming rental requests</h1>
      {declineError && (
        <p className="field-error" role="alert">Could not decline the request. {declineError.message}</p>
      )}
      {requests.length === 0 ? (
        <p className="booking-empty">No pending requests.</p>
      ) : (
        requests.map((b) => (
          <RequestCard key={b.id} booking={b} onDecline={handleDecline} declining={decliningId === b.id}
            disabled={decliningId !== null} />
        ))
      )}

      {extensions.length > 0 && (
        <>
          <h1 style={{ marginTop: 32 }}>Extension requests</h1>
          {extensions.map((b) => (
            <Link key={b.id} to={`/bookings/${b.id}/extension`} className="booking-card" style={{ textDecoration: 'none' }}>
              <h2>{getListing(b.listingId)?.title ?? 'Listing unavailable'}</h2>
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
