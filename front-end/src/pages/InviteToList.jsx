import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from 'react-router'
import { currentUserId } from '../data/demoData'
import { getInviteToListData, sendListInvites } from '../data/mockDataLayer'
import './InviteToList.css'
import BackLink from '../components/BackLink'

/** Small avatar. */
function UserPhoto({ user }) {
  return (
    <span className="invite-photo" aria-hidden="true">
      {user.photoUrl && <img src={user.photoUrl} alt="" />}
    </span>
  )
}

/**
 * Extracts just the first name from a full name string.
 */
function firstName(fullName) {
  return fullName.trim().split(/\s+/)[0]
}

export default function InviteToList() {
  const { cityId } = useParams()
  const navigate = useNavigate()
  // Fetch all data needed for this invite screen (friends list, list members,
  // invite link path, membership status, etc.) for the given city
  const data = useMemo(() => getInviteToListData(cityId), [cityId])
  // Friend user ids selected for this invite batch
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [copyMessage, setCopyMessage] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  // if no data was found for this cityId (e.g. invalid/unknown city),
  // exit early with a simple "not found" state instead of crashing
  // on undefined data below
  if (!data) {
    return (
      <section className="invite-page">
        <p>City list not found.</p>
        <Link to="/">Back to your lists</Link>
      </section>
    )
  }
  // if the current user isn't actually a member of this list,
  // they shouldn't be able to invite others to it so show a forbidden
  // state instead of the invite UI
  if (data.status === 'forbidden') {
    return (
      <section className="invite-page">
        <p>You can only invite friends to lists you belong to.</p>
        <Link to={`/city/${cityId}`}>Back to city</Link>
      </section>
    )
  }
  const memberNames = data.members.map((m) => firstName(m.name)).join(', ')

  // Toggles a friend's selected/checked state when their row is clicked
  function toggleFriend(friend) {
    if (friend.alreadyInvited) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(friend.id)) next.delete(friend.id)
      else next.add(friend.id)
      return next
    })
  }

  // Copies the shareable invite link to the clipboard
  async function copyInviteLink() {
    const url = `${window.location.origin}${data.invitePath}`
    try {
      await navigator.clipboard.writeText(url)
      setCopyMessage('Copied!')
    } catch {
      // Fallback if clipboard API is blocked
      setCopyMessage(url)
    }
    window.setTimeout(() => setCopyMessage(''), 2000)
  }

  // Sends invites to all currently selected friends
  function handleInvite() {
    const toUserIds = [...selectedIds]
    if (toUserIds.length === 0) return
    sendListInvites({
      listId: data.listId,
      fromUserId: currentUserId,
      toUserIds,
    })
    setSubmitMessage(`Invited ${toUserIds.length} friend${toUserIds.length === 1 ? '' : 's'}.`)
    setSelectedIds(new Set())
    // Real app: stay or navigate home
    window.setTimeout(() => navigate(`/city/${cityId}`), 800)
  }
  return (
    <section className="invite-page">
      <header className="invite-header">
        <BackLink to={`/city/${cityId}`} label={`Back to ${data.cityName}`} className="mb-6" />
        <h1 className="invite-title">Who's coming to {data.cityName}?</h1>
        <p className="invite-subtitle">Invited friends can add places and vote</p>
      </header>
      <section aria-labelledby="invite-choose-heading">
        <h2 id="invite-choose-heading" className="invite-section-title">
          Choose friends
        </h2>
        {data.friendsToInvite.length === 0 ? (
          <p className="invite-empty">All your friends are already on this list.</p>
        ) : (
          <ul className="invite-friend-list">
            {data.friendsToInvite.map((friend) => {
              const checked = selectedIds.has(friend.id)
              const disabled = friend.alreadyInvited
              return (
                <li key={friend.id}>
                  <label className={`invite-friend-row${disabled ? ' invite-friend-row--disabled' : ''}`}>
                    <UserPhoto user={friend} />
                    <span className="invite-friend-text">
                      <span className="invite-friend-name">{friend.name}</span>
                      <span className="invite-friend-handle">@{friend.username}</span>
                      {disabled && (
                        <span className="invite-friend-note">Invite already sent</span>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleFriend(friend)}
                    />
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <section aria-labelledby="invite-already-heading">
        <h2 id="invite-already-heading" className="invite-section-title">
          Already in
        </h2>
        <div className="invite-already-row">
          {data.members.slice(0, 3).map((member) => (
            <UserPhoto key={member.id} user={member} />
          ))}
          <span className="invite-member-names">{memberNames}</span>
        </div>
      </section>
      <div className="invite-actions">
        <button type="button" className="invite-copy btn-secondary hover:bg-subtle" onClick={copyInviteLink}>
          Copy invite link
        </button>
        {copyMessage && <p className="invite-feedback">{copyMessage}</p>}
        <button type="button" className="invite-copy btn-secondary hover:bg-subtle" onClick={copyInviteLink}>
          Invite friends
        </button>
        {submitMessage && <p className="invite-feedback">{submitMessage}</p>}
      </div>
    </section>
  )
}
