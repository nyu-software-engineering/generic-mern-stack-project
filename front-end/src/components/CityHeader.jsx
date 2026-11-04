import { useState } from 'react'
import { Link } from 'react-router'
import './CityHeader.css'

function MemberAvatar({ member }) {
  const [imageFailed, setImageFailed] = useState(false)
  const initials = member.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('')

  return (
    <span className="city-header-avatar" title={member.name}>
      <span aria-hidden="true">{initials}</span>
      {member.photoUrl && !imageFailed && (
        <img className="city-header-avatar-image" src={member.photoUrl} alt="" onError={() => setImageFailed(true)} />
      )}
    </span>
  )
}

export default function CityHeader({ city, view, onViewChange }) {
  const members = city.members ?? []
  const visibleMembers = members.slice(0, 3)
  const extraMembers = members.length - visibleMembers.length

  return (
    <header className="city-header">
      <div className="city-header-toolbar">
        <Link className="city-header-back" to="/">
          <span aria-hidden="true">←</span> Your lists
        </Link>
        <div className="city-header-toggle" role="group" aria-label="City view">
          {['list', 'map'].map((option) => (
            <button
              key={option}
              className="city-header-view-button"
              type="button"
              aria-pressed={view === option}
              aria-controls="city-view"
              onClick={() => onViewChange(option)}
            >
              {option === 'list' ? 'List' : 'Map'}
            </button>
          ))}
        </div>
      </div>
      <div className="city-header-details">
        <div className="city-header-heading">
          <h1 className="city-header-title">{city.name}</h1>
          <p className="city-header-description">
            {city.placeCount} {city.placeCount === 1 ? 'place' : 'places'} saved by the group
          </p>
        </div>
        <Link
          className="city-header-members"
          to={`/city/${encodeURIComponent(city.id)}/members`}
          aria-label={`View ${members.length} ${members.length === 1 ? 'member' : 'members'} of ${city.name}`}
        >
          <span className="city-header-avatars" aria-hidden="true">
            {visibleMembers.map((member) => <MemberAvatar key={`${member.id}-${member.photoUrl}`} member={member} />)}
            {extraMembers > 0 && <span className="city-header-avatar city-header-avatar-extra">+{extraMembers}</span>}
          </span>
          <span className="city-header-member-label">Members <span aria-hidden="true">↗</span></span>
        </Link>
      </div>
    </header>
  )
}
