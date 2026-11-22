import { useState } from 'react'
import { Link } from 'react-router'
import Avatar from '../components/Avatar'
import { useInvitations } from '../hooks/useInvitations.js'

// "1 place", "2 places"
function count(number, word) {
  return `${number} ${word}${number === 1 ? '' : 's'}`
}

export default function Invites() {
  const { invites, loading, error, retry, busy, answer } = useInvitations()
  const [notice, setNotice] = useState(null)

  async function handleAnswer(invite, response) {
    setNotice(null)
    const result = await answer(invite.id, response)
    if (!result) return

    setNotice(response === 'accept'
      ? { text: `You joined ${invite.cityName}.`, cityId: result.cityId }
      : { text: `You declined the invite to ${invite.cityName}.` })
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
            <Link to={`/city/${notice.cityId}`} className="font-semibold text-brand hover:text-brand-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand">
              Open the list
            </Link>
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-card bg-peach px-4 py-3 text-sm text-ink">
          {error}{' '}
          <button type="button" onClick={retry} className="font-semibold underline">
            Try again
          </button>
        </p>
      )}

      {loading ? (
        <p role="status" className="mt-4 text-sm text-muted">Loading invitations…</p>
      ) : error && invites.length === 0 ? null : invites.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">No invitations right now.</p>
      ) : (
        <ul className="mt-5 flex list-none flex-col gap-4 p-0">
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
                  disabled={busy}
                  onClick={() => handleAnswer(invite, 'accept')}
                  className="min-h-11 flex-1 cursor-pointer rounded-button px-5 py-3 font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand bg-brand text-surface hover:bg-brand-dark"
                >
                  Accept
                </button>
                <button
                  type="button"
                  aria-label={`Decline invite to ${invite.cityName}`}
                  disabled={busy}
                  onClick={() => handleAnswer(invite, 'decline')}
                  className="min-h-11 flex-1 cursor-pointer rounded-button px-5 py-3 font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand border border-border bg-surface text-ink"
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
