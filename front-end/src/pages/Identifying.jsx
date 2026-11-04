import { Link, useLocation, useNavigate } from 'react-router'
import { useMemo } from 'react'
import DuplicateWarning from '../components/DuplicateWarning'
import PlaceConfirmCard from '../components/PlaceConfirmCard'
import {
  getDuplicateSavedPlace,
  getPlaceById,
  getPlaceCardData,
  getSharingMessage,
  mockSavePlaceToList,
} from '../data/mockDataLayer'
import './Identifying.css'

/**
 * Place Found screen
 * Reached from Create with: navigate('/create/identifying', { state: { lookup } })
 * Or from Did you mean with: { state: { lookup, placeId } }
 */
export default function Identifying() {
  const location = useLocation()
  const navigate = useNavigate()
  const lookup = location.state?.lookup

  // Which place we are confirming (from lookup or user pick on Did you mean)
  const placeId = location.state?.placeId ?? lookup?.placeId

  const card = useMemo(() => {
    if (!placeId) return null
    return getPlaceCardData(placeId, lookup)
  }, [placeId, lookup])

  const duplicate = useMemo(() => {
    if (!placeId) return null
    return getDuplicateSavedPlace(placeId)
  }, [placeId])

  // No data if user opened this URL directly
  if (!lookup || !placeId || !card) {
    return (
      <section className="flow-page">
        <p>Start by pasting a link on the Create screen.</p>
        <Link to="/create">Go to Create</Link>
      </section>
    )
  }

  const sharingMessage = getSharingMessage(card.cityId)
  const place = getPlaceById(placeId)

  function handleSave() {
    const result = mockSavePlaceToList({ placeId })
    if (!result.ok && result.reason === 'duplicate') return

    navigate('/create/success', {
      state: { placeId, cityId: card.cityId, placeName: card.name },
    })
  }

  function handleNotIt() {
    // Same link, but let user pick another place in this city
    navigate('/create/matches', {
      state: { lookup, cityId: card.cityId, fromPlaceFound: true },
    })
  }

  return (
    <section className="flow-page">
      <Link className="flow-back" to="/create" aria-label="Back">
        ←
      </Link>

      <p className="flow-eyebrow">Found it</p>
      <h1 className="flow-title">Is this the place?</h1>

      <PlaceConfirmCard
        thumbnailUrl={card.thumbnailUrl}
        name={card.name}
        subtitle={card.subtitle}
        categoryLabel={card.categoryLabel}
        sourceTag={card.sourceTag}
      />

      <p className="flow-info-box">{sharingMessage}</p>

      {duplicate && (
        <DuplicateWarning placeName={place.name} placeId={placeId} />
      )}

      <button
        type="button"
        className="btn-primary hover:btn-primary-hover"
        disabled={Boolean(duplicate)}
        onClick={handleSave}
      >
        Save to {card.cityName}
      </button>

      <button type="button" className="flow-link-button" onClick={handleNotIt}>
        Not it? See other matches
      </button>
    </section>
  )
}
