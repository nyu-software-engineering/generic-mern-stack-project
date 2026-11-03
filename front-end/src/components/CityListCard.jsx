import { Link } from 'react-router'
import './CityListCard.css'

// max no. of avatars shown to user in the card, the rest are +N bubble
const MAX_AVATARS = 3

/**
 * if a user has a profile photo, it's shown
 * otherwise show their first initial.
 * TODO: move to a shared component if CityHeader also renders avatars (#77)
 */
function Avatar({ member }) {
  if (member.photoUrl) {
    return <img className="avatar" src={member.photoUrl} alt={member.name} />
  }
  return (
    <span className="avatar avatar--initials" aria-label={member.name}>
      {member.name.charAt(0).toUpperCase()}
    </span>
  )
}

/**
 * home screen card for one city list (#79).
 * expects a city header from mockDataLayer: { id, name, placeCount, members }.
 * tapping the card opens that city's page.
 */
export default function CityListCard({ city }) {
  const { id, name, placeCount, members } = city
  // split members into the ones we show and a count of the overflow
  const shown = members.slice(0, MAX_AVATARS)
  const extra = members.length - shown.length

  return (
    // link (not <a>) so navigation happens client-side without a page reload
    <Link to={`/city/${id}`} className="city-card">
      <div className="city-card__info">
        <h3 className="city-card__city">{name}</h3>
        <p className="city-card__count">
          {placeCount} {placeCount === 1 ? 'place' : 'places'}
        </p>
      </div>

      <div className="city-card__avatars">
        {shown.map((m) => (
          <Avatar key={m.id} member={m} />
        ))}
        {/* only render the "+N" bubble when some members were not shown */}
        {extra > 0 && <span className="avatar avatar--more">+{extra}</span>}
      </div>
    </Link>
  )
}