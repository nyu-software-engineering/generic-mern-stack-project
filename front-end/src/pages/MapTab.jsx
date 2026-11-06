import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Button from '../components/Button'
import PlaceMap from '../components/PlaceMap'
import CategoryFilter from '../components/CategoryFilter'
import { filterPlacesByCategory } from '../components/mapPresentation'
import { getCityById, getPlaceCategories, getRankedCityPlaces, loadMyCityHeaders } from '../data/mockDataLayer'

export default function MapTab() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const currentResult = result?.attempt === attempt ? result : null
  useEffect(() => {
    const controller = new AbortController()
    loadMyCityHeaders({ signal: controller.signal })
      .then((cities) => {
        if (!controller.signal.aborted) setResult({ attempt, cities })
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ attempt, error: true })
      })
    return () => controller.abort()
  }, [attempt])

  function updateParam(name, value) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value === 'all') next.delete(name)
      else next.set(name, value)
      return next
    })
  }

  if (!currentResult) return <p className="map-tab-content" role="status">Loading your map…</p>
  if (currentResult.error) return (
    <section className="px-5 py-10 text-center">
      <h1 className="text-2xl font-semibold">We couldn’t load your cities</h1>
      <p className="mt-2 text-sm text-muted">Please try again in a moment.</p>
      <Button className="mt-4" onClick={() => setAttempt(attempt + 1)}>Try again</Button>
    </section>
  )

  const { cities } = currentResult
  if (cities.length === 0) return (
    <section className="px-5 py-10 text-center">
      <h1 className="text-2xl font-semibold">No city lists yet</h1>
      <p className="mt-2 text-sm text-muted">Save a place or accept an invitation to start your map.</p>
      <p className="mt-4 text-sm">
        <Link to="/create" className="font-semibold text-brand hover:text-brand-dark">Add a place</Link>
        {' · '}
        <Link to="/invites" className="font-semibold text-brand hover:text-brand-dark">View invitations</Link>
      </p>
    </section>
  )

  // Only joined lists are available; a URL cannot expose a pending invitation.
  const selectedCity = cities.find(({ id }) => id === searchParams.get('city'))
  const categoryParam = searchParams.get('category')
  const category = getPlaceCategories().some(({ id }) => id === categoryParam) ? categoryParam : 'all'
  const mapCities = selectedCity ? [selectedCity] : cities
  const places = filterPlacesByCategory(mapCities.flatMap(({ id }) => getRankedCityPlaces(id)), category)
  const mapCenter = getCityById(mapCities[0].id)?.coordinates
  const cityQuery = selectedCity ? `?view=list${category !== 'all' ? `&category=${category}` : ''}` : ''

  return (
    <section className="map-tab">
      <header className="map-tab-header">
        <h1>Your map</h1>
        <p>Explore the places saved in your city lists.</p>
        <label htmlFor="map-city">City</label>
        <select id="map-city" value={selectedCity?.id ?? 'all'} onChange={(event) => updateParam('city', event.target.value)}>
          <option value="all">All cities</option>
          {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
        </select>
      </header>
      <CategoryFilter value={category} onChange={(value) => updateParam('category', value)} />
      <div className="map-tab-content">
        <PlaceMap places={places} center={mapCenter} label={selectedCity?.name ?? 'All your cities'} />
        {selectedCity && <Link to={`/city/${selectedCity.id}${cityQuery}`}>Open {selectedCity.name} list →</Link>}
        {category !== 'all' && places.length === 0 && <button type="button" onClick={() => updateParam('category', 'all')}>Show all categories</button>}
      </div>
    </section>
  )
}