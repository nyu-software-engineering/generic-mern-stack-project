import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import VoteChips from '../components/VoteChips'
import BackLink from '../components/BackLink'
import { castVote, getPlaceDetail, getPlaceVotes } from '../data/mockDataLayer'

// Just the first name, so "Samantha Chen" reads as "Samantha"
function firstName(fullName) {
  return fullName.trim().split(/\s+/)[0]
}

// Opens the place in Google Maps. We use the coordinates because they point at the exact spot.
function mapsUrl({ coordinates, name }) {
  const query = coordinates ? `${coordinates.lat},${coordinates.lng}` : name
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export default function PlaceDetail() {
  const { placeId } = useParams()
  const place = useMemo(() => getPlaceDetail(placeId), [placeId])
  // If the photo link is broken we fall back to the plain peach block behind it
  const [photoFailed, setPhotoFailed] = useState(false)
  // Latest result from castVote. Only used while it still belongs to this place.
  const [voteResult, setVoteResult] = useState(null)
  const [voteError, setVoteError] = useState('')

  // The link in the URL doesn't match any place we know about
  if (!place) {
    return (
      <section className="px-5 py-10 text-center">
        <h1 className="text-2xl font-semibold">Place not found</h1>
        <p className="mt-2 text-sm text-muted">This place is unavailable or was removed.</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-brand hover:text-brand-dark">
          Back to your lists
        </Link>
      </section>
    )
  }

  // Read the tally fresh on every render, unless we just voted on this place
  const voteState = voteResult?.savedPlaceId === place.savedPlaceId
    ? voteResult
    : getPlaceVotes(place.savedPlaceId)

  function handleVote(value) {
    const result = castVote(place.savedPlaceId, value)
    if (result.ok) {
      setVoteResult(result)
      setVoteError('')
    } else {
      setVoteError(result.error)
    }
  }

  const voteHint = !voteState?.canVote
    ? 'Join this list to vote.'
    : voteState.myVote
      ? 'Tap another option to change your vote.'
      : 'Tap a vote to let the group know.'

  // "Food · East Village · saved by Siyona from TikTok". Parts we don't have are left out.
  const details = [
    place.categoryLabel,
    place.neighborhood,
    place.savedBy &&
    `saved by ${firstName(place.savedBy.name)}${place.sourcePlatform ? ` from ${place.sourcePlatform}` : ''}`,
  ].filter(Boolean)

  const buttonClass =
    'inline-flex min-h-11 items-center btn-secondary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand'

  return (
    <article>
      <div className="px-5 pt-6">
        <BackLink to={`/city/${place.cityId}`} label={`Back to ${place.cityName}`} className="mb-6" />
      </div>

      <div className="relative mx-5 h-56 overflow-hidden rounded-card bg-peach">
        {place.photoUrl && !photoFailed && (
          <img
            className="size-full object-cover"
            src={place.photoUrl}
            alt={`${place.name} from the original post`}
            onError={() => setPhotoFailed(true)}
          />
        )}
      </div>

      <div className="px-5 py-5">
        <h1 className="text-3xl font-semibold tracking-tight">{place.name}</h1>
        <p className="mt-1 text-sm text-muted">{details.join(' · ')}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {/* Places that haven't been saved from a post yet have no original link */}
          {place.sourceUrl && (
            <a className={buttonClass} href={place.sourceUrl} target="_blank" rel="noopener noreferrer">
              Original post
            </a>
          )}
          <a className={buttonClass} href={mapsUrl(place)} target="_blank" rel="noopener noreferrer">
            Google Maps
          </a>
        </div>

        {/* Places that aren't saved to a list yet have nothing to vote on */}
        {voteState && (
          <section className="mt-8" aria-label="Votes">
            <VoteChips
              value={voteState.myVote}
              counts={voteState.counts}
              disabled={!voteState.canVote}
              onChange={handleVote}
            />
            <p className="mt-2 text-sm text-muted" role="status">
              {voteError || voteHint}
            </p>
          </section>
        )}
        <Link
          to={`/place/${place.id}/edit`}
          className="mt-6 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
        >
          Something wrong? Correct this place
        </Link>
      </div>
    </article>
  )
}
