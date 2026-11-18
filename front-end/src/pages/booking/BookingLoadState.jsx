// Loading, not-found and error states shared by the booking pages.
function BookingLoadState({ loadError, retry }) {
  if (!loadError) return <main className="booking-page"><p role="status">Loading booking...</p></main>
  if (loadError.status === 404 || loadError.status === 403) {
    return <main className="booking-page"><p>Booking not found.</p></main>
  }
  return (
    <main className="booking-page">
      <p role="alert">Could not load this booking. {loadError.message}</p>
      <button type="button" className="booking-btn" onClick={retry}>Retry</button>
    </main>
  )
}

export default BookingLoadState
