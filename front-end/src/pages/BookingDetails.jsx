import { Link, useNavigate, useParams } from 'react-router'
import './Booking.css'

export default function BookingDetails({ bookings, updateBooking, services = [] }) {
  const { bookingId } = useParams()
  const booking = bookings.find(b => b.id === bookingId)
  const navigate = useNavigate()
  if (!booking) return <p>Booking not found.</p>
  const service = services.find(s => String(s.id) === booking.serviceId)
  async function cancel() {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await updateBooking(booking.id, { status: 'cancelled' })
      navigate('/bookings')
    } catch (err) {
      window.alert(err.response?.data?.error || 'Unable to cancel booking.')
    }
  }
  return <div className="booking-content">
    <h1>Booking details</h1>
    <div className="booking-card"><strong>{booking.status}</strong>
      <p>{service?.title} · {service?.provider}</p><p>{booking.date} · {booking.time}</p>
      <p>${service?.price} / {service?.priceUnit}</p>
    </div>
    <h2>Your provider</h2>
    <img className="booking-hero" src={`https://picsum.photos/seed/provider-${booking.serviceId}/900/550`} alt="Placeholder provider" />
    <p>{service?.provider}</p>
    <h2>Your request</h2><p>{booking.notes || 'No additional notes.'}</p>
    {['requested', 'confirmed'].includes(booking.status) && <>
      <Link className="booking-button" to={`/bookings/${booking.id}/reschedule`}>Reschedule booking</Link>
      <button className="booking-button danger" onClick={cancel}>Cancel booking</button>
    </>}
  </div>
}
