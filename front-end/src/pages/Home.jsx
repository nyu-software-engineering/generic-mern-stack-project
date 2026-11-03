import { Link } from 'react-router'
import categories from '../categories.json'
import services from '../services.json'
import ServiceCard from './ServiceCard'
import './Home.css'

export default function Home() {
  return (
    <div className='home'>
      <header className='home-header'>
        <strong>
          CampusMart
        </strong>
        <span>
          NYU
        </span>
        <Link to='/profile'>
          Account
        </Link>
      </header>

      <section>
        <h1>
          Services from your campus
        </h1>
        <p>
          Discover student talent at NYU
        </p>
        <Link to='/search' className='home-search'>
          <strong>
            Search services
          </strong>
          <strong>
            Look up services...
          </strong>
        </Link>

        <a href="#categories" className='home-category-jump'>
          Service categories
        </a>

        <h2 id='categories'>
          Browse by service
        </h2>

        <ul className='home-categories'>
          {categories.map(category => (
              <li key={category}>
                {category}
              </li>
            )
          )}
        </ul>

        <h2>
          Featured services
        </h2>
        {services.map (service => (
          service.featured &&
          <ServiceCard key = {service.id} details = {service} />
        ))}

        <h2>
          Recently added
        </h2>
        {services.map (service => (
          service.recent && 
          <ServiceCard key = {service.id} details = {service} />
        ))}
      </section>

    </div>
  )
}