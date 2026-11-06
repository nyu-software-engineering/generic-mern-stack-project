import Avatar from './Avatar.jsx'
import './InviteBanner.css'

/**
 * Home-screen banner for one pending list invite (#67).
 * Expects an invite shaped by getPendingInvites: { id, cityName, sender }.
 * Home decides what Join does; the banner only reports the click.
 */
export default function InviteBanner({ invite, onJoin }) {
  // Figma shows first name only ("Zainab invited you...")
  const senderName = invite.sender?.name.trim().split(/\s+/)[0] ?? 'Someone'

  return (
    <div className="invite-banner">
      {invite.sender && <Avatar user={invite.sender} size="sm" />}
      <p className="invite-banner__text">
        {senderName} invited you to the <strong>{invite.cityName}</strong> list
      </p>
      <button
        type="button"
        className="invite-banner__join"
        aria-label={`Join the ${invite.cityName} list`}
        onClick={() => onJoin(invite)}
      >
        Join
      </button>
    </div>
  )
}