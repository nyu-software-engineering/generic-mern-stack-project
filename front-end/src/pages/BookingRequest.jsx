import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router'
import './Booking.css'

export default function BookingRequest({ bookings = [], addBooking, updateBooking, services = [] }) {
  const { serviceId, bookingId } = useParams()
  const previous = bookings.find(b => b.id === bookingId)
  const service = services.find(s => String(s.id) === (previous?.serviceId || serviceId))
  const navigate = useNavigate()
  const [date, setDate] = useState(previous?.date || '')
  const [time, setTime] = useState(previous?.time || '')
  const [availableTimes, setAvailableTimes] = useState([])
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [notes, setNotes] = useState(previous?.notes || '')
  const [showTimes, setShowTimes] = useState(false)
  const [error, setError] = useState('')
  const availableDays = service?.availability?.days || []
  const weekdayFor = value => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(`${value}T00:00:00Z`).getUTCDay()]
  const isOfferedDay = value => value && availableDays.includes(weekdayFor(value))
  useEffect(() => {
    if (!date || !service || !isOfferedDay(date)) { setAvailableTimes([]); return }
    let active = true
    setLoadingTimes(true)
    axios.get('/api/bookings/availability', { params: {
      serviceId: service.id, date, ...(previous ? { excludeBookingId: previous.id } : {})
    } }).then(response => {
      if (!active) return
      setAvailableTimes(response.data.slots)
      setTime(current => response.data.slots.includes(current) ? current : '')
    }).catch(() => {
      if (active) { setAvailableTimes([]); setError('Unable to load available times.') }
    }).finally(() => { if (active) setLoadingTimes(false) })
    return () => { active = false }
  }, [date, service?.id, previous?.id])
  if (bookingId && (!previous || !['requested', 'confirmed'].includes(previous.status))) return <p>This booking cannot be rescheduled.</p>
  if (!service) return <p>Service not found.</p>
  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!isOfferedDay(date) || !availableTimes.includes(time)) { setError('Please select an available time.'); return }
    try {
      if (previous) await updateBooking(previous.id, { date, time, notes, status: 'requested' })
      else await addBooking({ serviceId: String(service.id), date, time, notes })
      navigate('/bookings')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save booking. Please try again.')
    }
  }
  return <div className="booking-content">
    <h1>{previous ? 'Reschedule booking' : 'Request a booking'}</h1>
    <div className="booking-summary">{service.title}<br />{service.provider}<br />${service.price} / {service.priceUnit}</div>
    {error && <p className="booking-error" role="alert">{error}</p>}
    <form onSubmit={submit}>
      <label className="booking-form-field"><span>Date</span><input className="booking-input" type="date" required value={date} onChange={e => { const next = e.target.value; setDate(next); setTime(''); setShowTimes(false); setError(next && !isOfferedDay(next) ? 'Provider is unavailable on this day. Choose one of the listed weekdays.' : '') }} /></label>
      <p className="booking-note">Provider available: {availableDays.join(', ') || 'No days specified'} ({service.availability?.startTime}–{service.availability?.endTime}). Select one of these weekdays.</p>
      <div className="booking-form-field"><span>Time</span><button className="booking-button" type="button" onClick={() => setShowTimes(true)} disabled={!isOfferedDay(date) || loadingTimes}>{loadingTimes ? 'Loading...' : time || 'Choose available time'}</button></div>
      <label className="booking-form-field"><span>Notes for provider</span><textarea className="booking-input" value={notes} onChange={e => setNotes(e.target.value)} /></label>
      <p className="booking-note">Demo only: this request will not be sent to the provider.</p>
      <button className="booking-button primary" disabled={!isOfferedDay(date) || !availableTimes.includes(time)}>{previous ? 'Save new time' : 'Send booking request'}</button>
      <Link className="booking-button" to={previous ? `/bookings/${previous.id}` : `/services/${service.id}`}>Cancel</Link>
    </form>
    {showTimes && <div className="booking-modal-backdrop"><div className="booking-modal">
      <h2>Choose a time</h2>
        {availableTimes.length === 0 && <p>No available slots for this date.</p>}
        {availableTimes.map(t => <button key={t} type="button" className={`booking-button ${time === t ? 'selected' : ''}`} onClick={() => { setTime(t); setShowTimes(false) }}>{t}</button>)}
            <button className="booking-button" onClick={() => setShowTimes(false)}>Close</button>
    </div></div>}
  </div>
}
