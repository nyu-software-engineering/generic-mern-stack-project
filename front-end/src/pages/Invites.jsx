import { useState } from 'react'
import { Link } from 'react-router'
import Avatar from '../components/Avatar'
import { currentUserId } from '../data/demoData'
import { getPendingInvites, respondToInvite } from '../data/mockDataLayer'

// "1 place", "2 places"
function count(number, word) {
  return `${number} ${word}${number === 1 ? '' : 's'}`
}

export default function Invites() {
  // Load the invites once when the screen opens. They stay in state so a card
  // can disappear as soon as the user answers it.
  const [invites, setInvites] = useState(() => getPendingInvites(currentUserId))
  // The message under the title after an answer, e.g. "You joined New York."
  const [notice, setNotice] = useState(null)
  const [error, setError] = useState('')

  function answer(invite, response) {
    const result = respondToInvite(invite.id, response)

    // Either way the card goes away, so a second click can't answer it twice
    setInvites((current) => current.filter((item) => item.id !== invite.id))

    if (!result.ok) {
      setNotice(null)
      setError(result.error)
      return
    }

    setError('')
    setNotice(
      response === 'accept'
        ? { text: `You joined ${invite.cityName}.`, cityId: invite.cityId }
        : { text: `You declined the invite to ${invite.cityName}.` },
    )
  }

  return (
    <section className="px-5 py-6">
      <h1 className="text-3xl font-semibold tracking-tight">Invitations</h1>
      <p className="mt-1 text-sm text-muted">Friends who want you on their city list.</p>

      {/* role="status" so screen readers announce the result of Accept / Decline */}
      {notice && (
        <p role="status" className="mt-4 rounded-card bg-sage px-4 py-3 text-sm text-ink">
          {notice.text}{' '}
          {notice.cityId && (
            <Link to={`/city/${notice.cityId}`} className="font-semibold text-brand hover:text-brand-dark">
              Open the list
            </Link>
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-card bg-peach px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}

      {invites.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">No invitations right now.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {invites.map((invite) => (
            <li key={invite.id} className="rounded-card border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                {invite.sender && <Avatar user={invite.sender} size="sm" />}
                <p className="text-sm text-muted">
                  <span className="font-semibold text-ink">{invite.sender?.name ?? 'Someone'}</span> invited you
                </p>
              </div>

              <h2 className="mt-3 text-2xl font-semibold">{invite.cityName}</h2>
              <p className="mt-1 text-sm text-muted">
                {count(invite.placeCount, 'place')} · {count(invite.memberCount, 'member')}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  aria-label={`Accept invite to ${invite.cityName}`}
                  onClick={() => answer(invite, 'accept')}
                  className="min-h-11 flex-1 btn-primary hover:btn-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
                >
                  Accept
                </button>
                <button
                  type="button"
                  aria-label={`Decline invite to ${invite.cityName}`}
                  onClick={() => answer(invite, 'decline')}
                  className="min-h-11 flex-1 btn-secondary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
