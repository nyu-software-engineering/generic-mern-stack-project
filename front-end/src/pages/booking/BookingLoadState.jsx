import { Link } from 'react-router-dom'

// Loading, not-found and error states shared by the booking pages.
function BookingLoadState({ loadError, retry }) {
  if (!loadError) return <main className="ds-page booking-page ds-booking"><p className="ds-status" role="status">Loading booking...</p></main>
  if (loadError.status === 404 || loadError.status === 403) {
    return <main className="ds-page booking-page ds-booking"><h1 className="ds-heading">Booking not found</h1><p>This booking is unavailable.</p><Link className="ds-text-link" to="/renter-dashboard">My Rentals</Link></main>
  }
  return (
    <main className="ds-page booking-page ds-booking">
      <h1 className="ds-heading">Could not load booking</h1>
      <p className="ds-feedback ds-feedback--error" role="alert">Could not load this booking. {loadError.message}</p>
      <button type="button" className="ds-button ds-button--secondary" onClick={retry}>Retry</button>
    </main>
  )
}

export default BookingLoadState
