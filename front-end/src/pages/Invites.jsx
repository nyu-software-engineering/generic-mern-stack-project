import { useState } from 'react'
import './InvitationsInbox.css'
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
    <section className="invitations-inbox">
      <h1 className="invitations-inbox__title">Invitations</h1>
      <p className="invitations-inbox__description">Friends who want you on their city list.</p>

      {/* role="status" so screen readers announce the result of Accept / Decline */}
      {notice && (
        <p role="status" className="invitations-inbox__notice">
          {notice.text}{' '}
          {notice.cityId && (
            <Link to={`/city/${notice.cityId}`} className="invitations-inbox__link">
              Open the list
            </Link>
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="invitations-inbox__error">
          {error}
        </p>
      )}

      {invites.length === 0 ? (
        <p className="invitations-inbox__empty">No invitations right now.</p>
      ) : (
        <ul className="invitations-inbox__list">
          {invites.map((invite) => (
            <li key={invite.id} className="invitations-inbox__card">
              <div className="invitations-inbox__sender">
                {invite.sender && <Avatar user={invite.sender} size="sm" />}
                <p className="invitations-inbox__sender-text">
                  <span className="invitations-inbox__sender-name">{invite.sender?.name ?? 'Someone'}</span> invited you
                </p>
              </div>

              <h2 className="invitations-inbox__city">{invite.cityName}</h2>
              <p className="invitations-inbox__description">
                {count(invite.placeCount, 'place')} · {count(invite.memberCount, 'member')}
              </p>

              <div className="invitations-inbox__actions">
                <button
                  type="button"
                  aria-label={`Accept invite to ${invite.cityName}`}
                  onClick={() => answer(invite, 'accept')}
                  className="invitations-inbox__button invitations-inbox__button--accept"
                >
                  Accept
                </button>
                <button
                  type="button"
                  aria-label={`Decline invite to ${invite.cityName}`}
                  onClick={() => answer(invite, 'decline')}
                  className="invitations-inbox__button invitations-inbox__button--decline"
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
