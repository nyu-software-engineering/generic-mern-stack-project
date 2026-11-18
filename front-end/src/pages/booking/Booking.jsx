import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BookingForm from './BookingForm'
import ListingSummary from './ListingSummary'
import { CURRENT_USER_ID, getListing } from '../../services/bookings'
import { requestBooking } from '../../services/bookingsApi'
import { cacheListing } from '../../services/mockDataService'
import { getPublicListing } from '../../services/publicListings'
import './booking.css'

// Request rental (prototype m21). Item details can prefill dates with
// /listings/:listingId/request?start=YYYY-MM-DD&end=YYYY-MM-DD
function Booking() {
  const { listingId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(0)
  // Show the cached copy right away, then refresh it from the public listing route,
  // so listings published after the page loaded can still be requested.
  const [result, setResult] = useState(() => {
    const cached = getListing(listingId)
    return cached?.status === 'published' ? { listingId, listing: cached } : null
  })

  useEffect(() => {
    let current = true
    getPublicListing(listingId).then(
      (listing) => {
        if (!current) return
        cacheListing(listing)
        setResult({ listingId, listing })
      },
      (error) => {
        if (!current) return
        // Keep showing the cached copy if only the refresh failed.
        setResult((previous) => (error.status !== 404 && previous?.listingId === listingId && previous.listing)
          ? previous
          : { listingId, error })
      },
    )
    return () => { current = false }
  }, [listingId, attempt])

  if (result?.listingId !== listingId) {
    return <main className="booking-page"><p role="status">Loading listing...</p></main>
  }
  if (result.error && result.error.status !== 404) {
    return (
      <main className="booking-page">
        <p role="alert">Could not load this listing. {result.error.message}</p>
        <button type="button" className="booking-btn" onClick={() => setAttempt((value) => value + 1)}>
          Retry
        </button>
      </main>
    )
  }

  const { listing } = result
  if (!listing || listing.status !== 'published') {
    return <main className="booking-page"><p>This listing is not available.</p></main>
  }
  if (listing.ownerId === CURRENT_USER_ID) {
    return <main className="booking-page"><p>You can&apos;t request your own listing.</p></main>
  }

  // Throws on failure so the form can show the server's message.
  const handleSubmit = async (form) => {
    const booking = await requestBooking({ ...form, listingId: listing.id })
    navigate(`/bookings/${booking.id}`)
  }

  return (
    <main className="booking-page">
      <h1>Request rental</h1>
      <ListingSummary listing={listing} />
      <BookingForm
        listing={listing}
        initialStart={searchParams.get('start') ?? ''}
        initialEnd={searchParams.get('end') ?? ''}
        onSubmit={handleSubmit}
      />
      <p className="booking-note" style={{ marginTop: 12 }}>
        Track pending requests in <Link to="/renter-dashboard">My Rentals</Link>.
      </p>
    </main>
  )
}

export default Booking
