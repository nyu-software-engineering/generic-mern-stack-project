import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { loadMyCityHeaders, getPendingInvites, respondToInvite } from '../data/mockDataLayer.js'
import { currentUserId } from '../data/demoData.js'
import CityListCard from '../components/CityListCard.jsx'
import MostSavedByFriends from '../components/MostSavedByFriends.jsx'
import InviteBanner from '../components/InviteBanner.jsx'
import './Home.css'

/**
 * home screen (#79): shows a card for each city list the logged-in user is a member of.
 * also shows a banner for pending list invites (#67) and a bell with a dot when any are waiting.
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

  // getPendingInvites is synchronous, so read it once on first render (same as Invites.jsx)
  const [invites, setInvites] = useState(() => getPendingInvites(currentUserId))
  const [inviteError, setInviteError] = useState('')

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

  function handleJoin(invite) {
    const result = respondToInvite(invite.id, 'accept')
    // re-read instead of filtering locally, so Home always matches the data layer
    setInvites(getPendingInvites(currentUserId))

    if (!result.ok) {
      setInviteError(result.error)
      return
    }
    setInviteError('')
    // re-runs the effect, so loadMyCityHeaders picks up the city you just joined
    setReloadKey((k) => k + 1)
  }

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
      <header className="home-header">
        <span className="home-header__logo">Later?</span>
        <Link
          to="/invites"
          className="home-header__bell"
          aria-label={invites.length > 0 ? `Invitations, ${invites.length} new` : 'Invitations'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {/* dot only when something is waiting */}
          {invites.length > 0 && <span className="home-header__dot" aria-hidden="true" />}
        </Link>
      </header>

      {inviteError && <p role="alert" className="home-invite-error">{inviteError}</p>}

      {/* show the first pending invite; the rest live in the inbox */}
      {invites.length > 0 && <InviteBanner invite={invites[0]} onJoin={handleJoin} />}
      {invites.length > 1 && (
        <Link to="/invites" className="home-invite-more">See all {invites.length} invites</Link>
      )}

      {/* empty state for new users who aren't on any lists yet */}
      {cities.length === 0 ? (
        <p>No lists yet. Paste a link to save your first place.</p>
      ) : (
        cities.map((city) => <CityListCard key={city.id} city={city} />)
      )}
      <MostSavedByFriends />
    </main>
  )
}