import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import CityHeader from '../components/CityHeader'
import { loadCityHeaders } from '../data/mockDataLayer'
import './CityPage.css'

export default function CityPage() {
  const { cityId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const view = searchParams.get('view') === 'map' ? 'map' : 'list'
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
  return (
    <section className="city-page" aria-label={`${city.name} city list`}>
      <CityHeader city={city} view={view} onViewChange={changeView} />
      {/* #88 and #90 will replace these view containers with map pins and ranked places. */}
      <section id="city-view" className={`city-page-view city-page-view--${view}`} aria-label={`${view === 'map' ? 'Map' : 'List'} view`}>
        <h2 className="city-page-view-title">{view === 'map' ? 'Map view' : 'List view'}</h2>
      </section>
    </section>
  )
}
