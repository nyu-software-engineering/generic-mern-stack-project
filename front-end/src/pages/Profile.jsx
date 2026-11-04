import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import Avatar from '../components/Avatar'
import { currentUserId } from '../data/demoData'
import { getUserProfile } from '../data/mockDataLayer'

// The three little tags under "Your vibe" take turns using these colors
const chipColors = ['bg-peach', 'bg-powder', 'bg-sage']

export default function Profile() {
  const navigate = useNavigate()
  const profile = useMemo(() => getUserProfile(currentUserId), [])

  if (!profile) {
    return (
      <section className="px-5 py-10 text-center">
        <h1 className="text-2xl font-semibold">We couldn’t load your profile</h1>
        <Link to="/login" className="mt-4 inline-block font-semibold text-brand hover:text-brand-dark">
          Log in again
        </Link>
      </section>
    )
  }

  const stats = [
    { label: 'places saved', value: profile.stats.placesSaved },
    { label: 'city lists', value: profile.stats.cityLists },
    { label: 'places visited', value: profile.stats.placesVisited },
  ]

  function handleSignOut() {
    // There is no real login session yet, so signing out just goes back to the log-in screen.
    // replace stops the back button from returning to a screen for a signed-out user.
    navigate('/login', { replace: true })
  }

  return (
    <section className="px-5 py-6">
      <div className="flex items-center gap-4">
        <Avatar user={profile} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="truncate text-sm text-muted">@{profile.username}</p>
        </div>
        <Link
          to="/profile/edit"
          className="btn-secondary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          Edit
        </Link>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-card bg-background p-3">
            <dd className="text-2xl font-semibold">{stat.value}</dd>
            <dt className="text-xs text-muted">{stat.label}</dt>
          </div>
        ))}
      </dl>

      {profile.interests.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-semibold text-muted">Your vibe</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <li
                key={interest}
                className={`rounded-pill px-3 py-1.5 text-sm font-semibold ${chipColors[index % chipColors.length]}`}
              >
                {interest}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-8 text-sm font-semibold text-muted">Your cities</h2>
      {profile.cities.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          You haven’t joined a city list yet.{' '}
          <Link to="/invites" className="font-semibold text-brand hover:text-brand-dark">
            Check your invitations
          </Link>
        </p>
      ) : (
        <ul className="mt-2 flex flex-col">
          {profile.cities.map((city) => (
            <li key={city.id} className="border-b border-border">
              <Link to={`/city/${city.id}`} className="flex items-center justify-between py-3">
                <span className="font-semibold">{city.name}</span>
                <span className="text-sm text-muted">
                  {city.placeCount} {city.placeCount === 1 ? 'place' : 'places'} <span aria-hidden="true">›</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-8 font-semibold text-brand hover:text-brand-dark"
      >
        Log out
      </button>
    </section>
  )
}
