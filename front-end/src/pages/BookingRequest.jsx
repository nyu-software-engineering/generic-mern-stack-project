import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import services from '../services.json'
import './Booking.css'

export default function BookingRequest({ bookings = [], addBooking, updateBooking }) {
  const { serviceId, bookingId } = useParams()
  const previous = bookings.find(b => b.id === bookingId)
  const service = services.find(s => String(s.id) === (previous?.serviceId || serviceId))
  const navigate = useNavigate()
  const [date, setDate] = useState(previous?.date || '')
  const [time, setTime] = useState(previous?.time || '15:00')
  const [notes, setNotes] = useState(previous?.notes || '')
  const [showTimes, setShowTimes] = useState(false)
  if (bookingId && (!previous || !['requested', 'confirmed'].includes(previous.status))) return <p>This booking cannot be rescheduled.</p>
  if (!service) return <p>Service not found.</p>
  function submit(e) {
    e.preventDefault()
    if (previous) updateBooking(previous.id, { date, time, notes, status: 'requested' })
    else addBooking({ serviceId: String(service.id), date, time, notes })
    navigate('/bookings')
  }
  return <div className="booking-content">
    <h1>{previous ? 'Reschedule booking' : 'Request a booking'}</h1>
    <div className="booking-summary">{service.title}<br />{service.provider}<br />${service.price} / {service.priceUnit}</div>
    <form onSubmit={submit}>
      <label className="booking-form-field"><span>Date</span><input className="booking-input" type="date" required value={date} onChange={e => setDate(e.target.value)} /></label>
      <div className="booking-form-field"><span>Time</span><button className="booking-button" type="button" onClick={() => setShowTimes(true)}>{time}</button></div>
      <label className="booking-form-field"><span>Notes for provider</span><textarea className="booking-input" value={notes} onChange={e => setNotes(e.target.value)} /></label>
      <p className="booking-note">Demo only: this request will not be sent to the provider.</p>
      <button className="booking-button primary">{previous ? 'Save new time' : 'Send booking request'}</button>
      <Link className="booking-button" to={previous ? `/bookings/${previous.id}` : `/services/${service.id}`}>Cancel</Link>
    </form>
    {showTimes && <div className="booking-modal-backdrop"><div className="booking-modal">
      <h2>Choose a time</h2>
        {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'].map(t => <button key={t} type="button" className={`booking-button ${time === t ? 'selected' : ''}`} onClick={() => { setTime(t); setShowTimes(false) }}>{t}</button>)}      <button className="booking-button" onClick={() => setShowTimes(false)}>Close</button>
    </div></div>}
  </div>
}
