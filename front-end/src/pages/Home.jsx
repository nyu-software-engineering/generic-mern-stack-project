import { Link } from 'react-router'
import { api } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { useInvitations } from '../hooks/useInvitations.js'
import CityListCard from '../components/CityListCard.jsx'
import MostSavedByFriends from '../components/MostSavedByFriends.jsx'
import InviteBanner from '../components/InviteBanner.jsx'
import './Home.css'

function loadMyCityHeaders(options) {
  return api.get('/api/lists', options)
}

export default function Home() {
  const { data: cities, loading, error, retry } = useApi(loadMyCityHeaders)
  const invitations = useInvitations()
  const invites = invitations.invites

  async function handleJoin(invite) {
    const result = await invitations.answer(invite.id, 'accept')
    if (result) retry()
  }

  if (loading) return <p>Loading your lists…</p>

  if (error) {
    return (
      <div>
        <p role="alert">{error.message}</p>
        <button onClick={retry}>Try again</button>
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

      {invitations.error && (
        <div className="home-invite-error">
          <p role="alert">{invitations.error}</p>
          <button type="button" onClick={invitations.retry}>Try again</button>
        </div>
      )}

      {/* show the first pending invite; the rest live in the inbox */}
      {invites.length > 0 && (
        <fieldset className="m-0 min-w-0 border-0 p-0" disabled={invitations.busy}>
          <InviteBanner invite={invites[0]} onJoin={handleJoin} />
        </fieldset>
      )}
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