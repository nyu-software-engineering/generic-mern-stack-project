import services from '../services.json'
import ServiceCard from './ServiceCard'

export default function Home() {
  return (
    <section>
      <h1>
        services from your campus
      </h1>

      {services.map(service => (
        <ServiceCard key = {service.id} details = {service} />
      ))}
    </section>
  )
}