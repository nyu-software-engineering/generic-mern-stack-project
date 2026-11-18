import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BookingForm from './BookingForm'
import ListingSummary from './ListingSummary'
import { CURRENT_USER_ID, getListing } from '../../services/bookings'
import { requestBooking } from '../../services/bookingsApi'
import './booking.css'

// Request rental (prototype m21). Item details can prefill dates with
// /listings/:listingId/request?start=YYYY-MM-DD&end=YYYY-MM-DD
function Booking() {
  const { listingId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const listing = getListing(listingId)

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
