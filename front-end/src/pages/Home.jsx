import { Link } from 'react-router'
import { useState } from 'react'
import categories from '../categories.json'
import services from '../services.json'
import ServiceCard from './ServiceCard'
import Header from './Header'
import './Home.css'

export default function Home() {
  const [showCategories, setShowCategories] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState('All services')
  return (
    <div className='home'>
      <Header />
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

        <button type='button' className='home-category-jump' onClick={() =>
          setShowCategories(true)
        }>
          Service categories
        </button>

        <h2 id='categories'>
          Browse by service
        </h2>

        <ul className='home-categories'>
          {categories.map(category => (
            (selectedCategories === 'All services' || selectedCategories === category) &&
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
          service.featured && (selectedCategories === 'All services' || selectedCategories === service.category) &&
          <ServiceCard key = {service.id} details = {service} />
        ))}

        <h2>
          Recently added
        </h2>
        {services.map (service => (
          service.recent && (selectedCategories === 'All services' || selectedCategories === service.category) && 
          <ServiceCard key = {service.id} details = {service} />
        ))}
      </section>

      {showCategories && (
        <div className='category-backdrop'>
          <div className='category-modal' role='dialog' aria-modal='true'>
            <h2>
              Service categories
            </h2>

            <button type='button' onClick={() => {
              setSelectedCategories('All services') 
              setShowCategories(false)
            }}>
              All services
            </button>

            {categories.map(category => (
              <button type='button' key={category} onClick={() => {
                setSelectedCategories(category)
                setShowCategories(false)
              }}>
                {category}
              </button>
            ))}

            <button type='button' onClick={() => setShowCategories(false)}>
              Close menu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}