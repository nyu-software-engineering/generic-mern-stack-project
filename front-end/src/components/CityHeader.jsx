import { Link } from 'react-router'
import AvatarStack from './AvatarStack'
import './CityHeader.css'

export default function CityHeader({ city, view, onViewChange }) {
  const members = city.members ?? []

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
          <span aria-hidden="true">
            <AvatarStack members={members} />
          </span>
          <span className="city-header-member-label">Members <span aria-hidden="true">↗</span></span>
        </Link>
      </div>
    </header>
  )
}
