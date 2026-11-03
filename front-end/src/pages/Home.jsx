import { useEffect, useState } from 'react'
import { loadMyCityHeaders } from '../data/mockDataLayer.js'
import CityListCard from '../components/CityListCard.jsx'

/**
 * home screen (#79): shows a card for each city list the logged-in user is a member of.
 * data comes from mockDataLayer for now; swap loadMyCityHeaders for real API call later.
 */
export default function Home() {
/*
* when Home first shows up, it starts with an empty list of cities, 
* loading set to true, no error, and a reload counter at 0. 
* because loading is true, the first thing it renders is just “Loading your lists…”.
*/
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // bumping this re-runs the effect below, which is how "Try again" re-fetches
  const [reloadKey, setReloadKey] = useState(0)

/* 
* Right after that first render, the effect kicks in. 
* it creates a cancel switch (the AbortController), resets loading to true and clears any old error, 
* then asks the data layer for “the cities I’m a member of,” handing over the cancel switch, then waits
*/
  useEffect(() => {
    // lets us cancel the request if the user leaves Home before it finishes
    const controller = new AbortController()
    // reset both on every load so a retry clears the old error
    setLoading(true)
    setError(null)

    loadMyCityHeaders({ signal: controller.signal })
      .then((data) => setCities(data))
      .catch((err) => {
        // AbortError just means we cancelled on purpose, not a real failure
        if (err.name !== 'AbortError') setError("Couldn't load your lists.")
      })
      .finally(() => {
        // skip if cancelled: Home is gone or a newer load has taken over
        if (!controller.signal.aborted) setLoading(false)
      })
    
    // cleanup: cancel the in-flight load when Home unmounts or reloads
    return () => controller.abort()
  }, [reloadKey])

  // render: pick what to show based on current state (loading → error → cities)
  
  if (loading) return <p>Loading your lists…</p>

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
      </div>
    )
  }

  return (
    <main>
      <h1 className="p-4 text-2xl font-bold">Home</h1>
      {/* empty state for new users who aren't on any lists yet */}
      {cities.length === 0 ? (
        <p>No lists yet. Paste a link to save your first place.</p>
      ) : (
        cities.map((city) => <CityListCard key={city.id} city={city} />)
      )}
    </main>
  )
}