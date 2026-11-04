import { Link } from 'react-router'
import './CityListCard.css'
import AvatarStack from './AvatarStack.jsx'

/**
 * home screen card for one city list (#79).
 * expects a city header from mockDataLayer: { id, name, placeCount, members }.
 * tapping the card opens that city's page.
 */
export default function CityListCard({ city }) {
  const { id, name, placeCount, members } = city
  // split members into the ones we show and a count of the overflow

  return (
    // link (not <a>) so navigation happens client-side without a page reload
    <Link to={`/city/${id}`} className="city-card">
      <div className="city-card__info">
        <h3 className="city-card__city">{name}</h3>
        <p className="city-card__count">
          {placeCount} {placeCount === 1 ? 'place' : 'places'}
        </p>
      </div>

      <AvatarStack members={members} max={3} />
    </Link>
  )
}