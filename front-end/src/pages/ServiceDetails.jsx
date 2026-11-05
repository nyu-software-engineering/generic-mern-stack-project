import { Link, useParams } from 'react-router'
import services from '../services.json'
import './Booking.css'

export default function ServiceDetails() {
  const { serviceId } = useParams()
  const service = services.find(s => String(s.id) === serviceId)
  if (!service) return <p>Service not found.</p>
  return <div className="booking-content">
    <h1>{service.title}</h1><h2>${service.price} / {service.priceUnit}</h2>
    <p>{service.provider} · {service.category}</p>
    <img className="booking-hero" src={`https://picsum.photos/seed/${service.id}/900/550`} alt={service.title} />
    <h2>About this service</h2><p>{service.title} offered by {service.provider}.</p>
    <h2>Availability</h2><p>Contact the provider to confirm availability.</p>
    <Link className="booking-button primary" to={`/services/${service.id}/request`}>Request booking</Link>
  </div>
}
