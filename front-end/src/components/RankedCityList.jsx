import { useState } from 'react'
import { Link } from 'react-router'
import './RankedCityList.css'

function PlacePhoto({ place }) {
  const [failedUrl, setFailedUrl] = useState(null)

  return (
    <div className="ranked-place-photo" aria-hidden="true">
      {place.photoUrl && failedUrl !== place.photoUrl ? (
        <img src={place.photoUrl} alt="" loading="lazy" onError={() => setFailedUrl(place.photoUrl)} />
      ) : <span>📍</span>}
    </div>
  )
}

export default function RankedCityList({ places }) {
  if (places.length === 0) {
    return (
      <div className="ranked-city-empty">
        <h2>No places saved yet</h2>
        <p>Save a place to start planning with your group.</p>
        <Link to="/create">Add a place</Link>
      </div>
    )
  }

  return (
    <>
      <div className="ranked-city-intro">
        <h2>Your group’s picks</h2>
        <p>Most must-go votes first</p>
      </div>
      <ol className="ranked-city-list" aria-label="Places ranked by must-go votes">
        {places.map((place, index) => {
          const totalVotes = place.tally['must-go'] + place.tally.down + place.tally.pass
          return (
            <li key={place.savedPlaceId}>
              <Link className="ranked-place-card" to={`/place/${place.id}`} aria-label={`View ${place.name}`}>
                <PlacePhoto place={place} />
                <div className="ranked-place-content">
                  <p className="ranked-place-category">{place.categoryLabel}</p>
                  <h3>{place.name}</h3>
                  <p className="ranked-place-neighborhood">{place.neighborhood}</p>
                  {totalVotes === 0 ? <p className="ranked-place-no-votes">No votes yet</p> : (
                    <dl className="ranked-place-votes" aria-label="Group votes">
                      <div><dt>Must-go</dt><dd>{place.tally['must-go']}</dd></div>
                      <div><dt>Down for it</dt><dd>{place.tally.down}</dd></div>
                      <div><dt>Pass</dt><dd>{place.tally.pass}</dd></div>
                    </dl>
                  )}
                </div>
                <span className="ranked-place-rank" aria-hidden="true">{index + 1}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </>
  )
}
