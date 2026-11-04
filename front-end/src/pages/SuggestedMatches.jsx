import { useMemo, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import DuplicateWarning from '../components/DuplicateWarning'
import PlaceConfirmCard from '../components/PlaceConfirmCard'
import {
  getAmbiguousCandidates,
  getDuplicateSavedPlace,
  getLookupCityId,
  getPlaceById,
  searchPlacesInCity,
} from '../data/mockDataLayer'
import './SuggestedMatches.css'

/**
 * Did you mean?
 * From Create: navigate('/create/matches', { state: { lookup } }) when status is "ambiguous"
 */
export default function SuggestedMatches() {
  const location = useLocation()
  const navigate = useNavigate()
  const lookup = location.state?.lookup
  const cityId = location.state?.cityId ?? getLookupCityId(lookup)

  const [searchText, setSearchText] = useState('')

  const keywords = lookup?.keywords ?? []

  const candidates = useMemo(() => getAmbiguousCandidates(lookup), [lookup])

  const [selectedPlaceId, setSelectedPlaceId] = useState(null)

  useEffect(() => {
    const best = candidates.find((row) => row.bestMatch)
    setSelectedPlaceId(best?.placeId ?? candidates[0]?.placeId ?? null)
  }, [lookup, candidates])

  const searchResults = useMemo(() => {
    if (!cityId) return []
    return searchPlacesInCity(cityId, searchText)
  }, [cityId, searchText])

  const duplicate = useMemo(() => {
    if (!selectedPlaceId) return null
    return getDuplicateSavedPlace(selectedPlaceId)
  }, [selectedPlaceId])

  const selectedPlace = selectedPlaceId ? getPlaceById(selectedPlaceId) : null

  if (!lookup || !cityId) {
    return (
      <section className="flow-page">
        <p>Start by pasting a link on the Create screen.</p>
        <Link to="/create">Go to Create</Link>
      </section>
    )
  }

  // update selection on click
  function choosePlace(placeId) {
    setSelectedPlaceId(placeId)
  }

  function confirmChoice() {
    if (!selectedPlaceId || duplicate) return
    navigate('/create/identifying', {
      state: { lookup, placeId: selectedPlaceId },
    })
  }

  // Show search results when typing; otherwise show link candidates
  const listToShow = searchText.trim() ? searchResults : candidates

  return (
    <section className="flow-page">
      <Link className="flow-back" to="/create" aria-label="Back">
        ←
      </Link>

      <h1 className="flow-title">Close. Which one is it?</h1>

      {keywords.length > 0 && (
        <>
          <p className="flow-keywords-intro">
            We couldn&apos;t pin down one place, but here&apos;s what the post mentioned:
          </p>
          <ul className="flow-keywords" aria-label="Words from the post">
            {keywords.map((word) => (
              <li key={word} className="flow-keyword">
                &quot;{word}&quot;
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="flow-candidate-list">
        {listToShow.length === 0 ? (
          <p className="flow-empty">No matches. Try another search.</p>
        ) : (
          listToShow.map((row) => (
            <PlaceConfirmCard
              key={row.placeId}
              thumbnailUrl={row.photoUrl}
              name={row.name}
              subtitle={row.subtitle}
              bestMatch={row.bestMatch}
              isSelected={row.placeId === selectedPlaceId}
              selectable
              onSelect={() => choosePlace(row.placeId)}
            />
          ))
        )}
      </div>

      {/* <label className="flow-search-label" htmlFor="place-search">
        None of these, search instead
      </label> */}
      <input
        id="place-search"
        className="input-field flow-search-input"
        type="search"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="None of these, search instead"
      />

      {selectedPlace && (
        <div className="flow-selected">
          <p>
            Selected: <strong>{selectedPlace.name}</strong>
          </p>
          {duplicate && (
            <DuplicateWarning placeName={selectedPlace.name} placeId={selectedPlaceId} />
          )}
          <button
            type="button"
            className="flow-primary"
            disabled={Boolean(duplicate)}
            onClick={confirmChoice}
          >
            Use this place
          </button>
        </div>
      )}
    </section>
  )
}
