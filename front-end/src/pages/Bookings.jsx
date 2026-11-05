import { useState } from 'react'
import { Link } from 'react-router'
import services from '../services.json'
import Header from './Header'
import './Booking.css'

export default function Bookings({ bookings }) {
  const [period, setPeriod] = useState('upcoming')
  const visible = bookings.filter(b => period === 'upcoming' ? ['requested', 'confirmed'].includes(b.status) : ['completed', 'cancelled'].includes(b.status))
  return (
  <>
  <Header />
  <div className="booking-content">
    <h1>Manage bookings</h1><p>As client</p>
    <div className="booking-switch"><button className="booking-button" onClick={() => setPeriod('upcoming')}>Upcoming</button><button className="booking-button" onClick={() => setPeriod('past')}>Past</button></div>
    <h2>{period === 'upcoming' ? 'Upcoming bookings' : 'Past bookings'}</h2>
    {visible.length === 0 && <p>No bookings yet.</p>}
    {visible.map(b => {
      const service = services.find(s => String(s.id) === b.serviceId)
      return <div className="booking-card" key={b.id}>
        <strong>{b.status}</strong><p>{service?.title || 'Service'} · {service?.provider}</p>
        <p>{b.date} · {b.time}</p>
        <Link className="booking-button" to={`/bookings/${b.id}`}>View booking</Link>
      </div>
    })}
  </div>
  </>
  )
}
