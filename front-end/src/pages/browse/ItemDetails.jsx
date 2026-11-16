import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CURRENT_USER_ID,
  getUser,
  listingImage,
} from '../../services/bookings'
import { cacheListing } from '../../services/mockDataService.js'
import { getPublicListing } from '../../services/publicListings.js'
import SaveListingButton, { SavedItemsStatus } from '../../components/SaveListingButton.jsx'
import './browse.css'

function ItemDetails() {
  const { id } = useParams()
  return <ItemDetailsRequest key={id} id={id} />
}

function ItemDetailsRequest({ id }) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let current = true
    getPublicListing(id)
      .then((listing) => {
        if (!current) return
        // The booking form and report flow still read from this cache.
        cacheListing(listing)
        setResult({ listing })
      })
      .catch((error) => { if (current) setResult({ error }) })
    return () => { current = false }
  }, [id, attempt])

  if (!result) {
    return <main className="item-details-page"><p role="status">Loading item...</p></main>
  }

  if (result.error) {
    const unavailable = result.error.status === 404
    return (
      <main className="item-details-page">
        {unavailable ? (
          <>
            <h1>Item unavailable</h1>
            <p>This listing could not be found or is no longer published.</p>
          </>
        ) : (
          <>
            <h1>Could not load item</h1>
            <p role="alert">{result.error.message}</p>
            <button type="button" onClick={() => {
              setResult(null)
              setAttempt((value) => value + 1)
            }}>Try again</button>
          </>
        )}
        <Link to="/browse">Back to browse</Link>
      </main>
    )
  }

  return <ListingDetails listing={result.listing} />
}

function ListingDetails({ listing }) {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const owner = getUser(listing.ownerId)
  const isOwnListing = listing.ownerId === CURRENT_USER_ID

  const today = new Date()
  const todayString =
    `${today.getFullYear()}-` +
    `${String(today.getMonth() + 1).padStart(2, '0')}-` +
    `${String(today.getDate()).padStart(2, '0')}`

  const days =
    startDate && endDate
      ? (new Date(endDate) - new Date(startDate)) / 86400000
      : 0

  function handleRequest(event) {
    event.preventDefault()

    if (isOwnListing) {
      return
    }

    if (!startDate || !endDate) {
      setError('Select both pickup and return dates.')
      return
    }

    if (startDate < todayString) {
      setError('Pickup cannot be in the past.')
      return
    }

    if (endDate <= startDate) {
      setError('Return must be after pickup.')
      return
    }

    setError('')

    const query = new URLSearchParams({
      start: startDate,
      end: endDate,
    })

    navigate(`/listings/${listing.id}/request?${query.toString()}`)
  }

  return (
    <main className="item-details-page">
      <Link to="/browse">Back to browse</Link>

      <p>{listing.category}</p>
      <h1>{listing.title}</h1>
      <img
        src={listingImage(listing.id, 480)}
        alt={listing.title}
        width={300}
        height={300}
      />
      <p>{listing.description}</p>
      <p>Owner: {owner?.name ?? 'Student owner'}</p>
      <p>${listing.price.toFixed(2)} / day</p>

      {!isOwnListing && (
        <>
          <SavedItemsStatus />
          <SaveListingButton listing={listing} />
        </>
      )}

      <section>
        <h2>Rental terms</h2>
        <p>{listing.rentalTerms}</p>
      </section>

      {isOwnListing ? (
        <p>This is your listing. Other students can request to rent it.</p>
      ) : (
        <form onSubmit={handleRequest}>
          <h2>Select rental dates</h2>

          <label>
            Pickup date
            <input
              type="date"
              required
              min={todayString}
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value)
                setError('')
              }}
            />
          </label>

          <label>
            Return date
            <input
              type="date"
              required
              min={startDate || todayString}
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value)
                setError('')
              }}
            />
          </label>

          {days > 0 && (
            <p aria-live="polite">
              {days} {days === 1 ? 'day' : 'days'} · Estimated total: $
              {(days * listing.price).toFixed(2)}
            </p>
          )}

          {error && <p role="alert">{error}</p>}

          <button type="submit">Request rental</button>
        </form>
      )}

      {!isOwnListing && (
        <p><Link to={`/report?listingId=${listing.id}`}>Report this listing</Link></p>
      )}
    </main>
  )
}

export default ItemDetails
