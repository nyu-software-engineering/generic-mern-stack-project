import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import CityHeader from '../components/CityHeader'
import RankedCityList from '../components/RankedCityList'
import PlaceMap from '../components/PlaceMap'
import CategoryFilter from '../components/CategoryFilter'
import { filterPlacesByCategory } from '../components/mapPresentation'
import { getCityById, getPlaceCategories, getRankedCityPlaces, loadCityHeaders } from '../data/mockDataLayer'
import './CityPage.css'

export default function CityPage() {
  const { cityId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const view = searchParams.get('view') === 'map' ? 'map' : 'list'
  const categoryParam = searchParams.get('category')
  const category = getPlaceCategories().some(({ id }) => id === categoryParam) ? categoryParam : 'all'
  const currentResult = result?.cityId === cityId && result?.attempt === attempt
    ? result
    : null

  useEffect(() => {
    const controller = new AbortController()

    async function loadHeader() {
      try {
        const cities = await loadCityHeaders({ signal: controller.signal })
        const city = cities.find((item) => item.id === cityId)
        if (!controller.signal.aborted) {
          setResult({ cityId, attempt, status: city ? 'ready' : 'missing', city })
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult({ cityId, attempt, status: 'error' })
        }
      }
    }

    loadHeader()
    return () => controller.abort()
  }, [cityId, attempt])

  function changeView(nextView) {
    if (nextView === view) return
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      next.set('view', nextView)
      return next
    })
  }

  function changeCategory(nextCategory) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (nextCategory === 'all') next.delete('category')
      else next.set('category', nextCategory)
      return next
    })
  }

  if (!currentResult) {
    return <p className="city-page-message" role="status">Loading city…</p>
  }

  if (currentResult.status !== 'ready') {
    const missing = currentResult.status === 'missing'
    return (
      <section className="city-page-message">
        <h1 className="city-page-message-title">
          {missing ? 'City not found' : 'We couldn’t load this city'}
        </h1>
        <p>{missing ? 'This city list is unavailable.' : 'Please try again in a moment.'}</p>
        {!missing && (
          <button className="city-page-retry" type="button" onClick={() => setAttempt(attempt + 1)}>
            Try again
          </button>
        )}
        <Link className="city-page-home" to="/">Back to your lists</Link>
      </section>
    )
  }

  const { city } = currentResult
  const allPlaces = getRankedCityPlaces(city.id)
  const visiblePlaces = filterPlacesByCategory(allPlaces, category)
  return (
    <section className="city-page" aria-label={`${city.name} city list`}>
      <CityHeader city={city} view={view} onViewChange={changeView} />
      <CategoryFilter value={category} onChange={changeCategory} />
      <section id="city-view" className={`city-page-view city-page-view--${view}`} aria-label={`${view === 'map' ? 'Map' : 'List'} view`}>
        {visiblePlaces.length === 0 && category !== 'all' && (
          <div className="place-filter-empty" role="status">
            <p>No saved places in this category.</p>
            <button type="button" onClick={() => changeCategory('all')}>Show all categories</button>
          </div>
        )}
        {view === 'list' ? (
          (visiblePlaces.length > 0 || category === 'all') && <RankedCityList places={visiblePlaces} />
        ) : (
          <PlaceMap places={visiblePlaces} center={getCityById(city.id)?.coordinates} label={city.name} />
        )}
      </section>
    </section>
  )
}
