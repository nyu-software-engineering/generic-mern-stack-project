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
import Icon from '../../components/Icon.jsx'
import './itemDetails.css'

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
    return <main className="ds-page ds-item-details"><p className="ds-status" role="status">Loading item...</p></main>
  }

  if (result.error) {
    const unavailable = result.error.status === 404
    return (
      <main className="ds-page ds-item-details">
        <section className={`ds-feedback${unavailable ? '' : ' ds-feedback--error'}`}>
        {unavailable ? (
          <>
            <h1 className="ds-heading">Item unavailable</h1>
            <p>This listing could not be found or is no longer published.</p>
          </>
        ) : (
          <>
            <h1 className="ds-heading">Could not load item</h1>
            <p role="alert">{result.error.message}</p>
            <button className="ds-button ds-button--secondary" type="button" onClick={() => {
              setResult(null)
              setAttempt((value) => value + 1)
            }}>Try again</button>
          </>
        )}
        <Link className="ds-text-link" to="/browse"><Icon name="arrowLeft" />Back to browse</Link>
        </section>
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

  const pickupInvalid = Boolean(error && (!startDate || startDate < todayString))
  const returnInvalid = Boolean(error && (!endDate || (startDate && endDate <= startDate)))

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
    <main className="ds-page ds-item-details">
      <Link className="ds-text-link ds-back-link" to="/browse">
        <Icon name="arrowLeft" />Back to browse
      </Link>

      <div className="ds-item-layout">
        <section className="ds-item-content" aria-labelledby="item-title">
          <p className="ds-item-category">{listing.category}</p>
          <h1 className="ds-heading" id="item-title">{listing.title}</h1>
          <div className="ds-item-image">
            <img
              src={listingImage(listing.id, 480)}
              alt={listing.title}
              width={480}
              height={480}
            />
          </div>

          <div className="ds-item-owner">
            <span className="ds-owner-icon"><Icon name="profile" size={22} /></span>
            <p>Listed by <strong>{owner?.name ?? 'Student owner'}</strong></p>
          </div>

          <section className="ds-item-section" aria-labelledby="item-description-heading">
            <h2 id="item-description-heading">About this item</h2>
            <p>{listing.description}</p>
          </section>
          <section className="ds-item-section" aria-labelledby="rental-terms-heading">
            <h2 id="rental-terms-heading">Rental terms</h2>
            <p>{listing.rentalTerms}</p>
          </section>
        </section>

        <aside className="ds-rental-panel" aria-label="Rental details">
          <p className="ds-detail-price">${listing.price.toFixed(2)} <span>/ day</span></p>

          {isOwnListing ? (
            <div className="ds-feedback">
              <h2>Your listing</h2>
              <p>This is your listing. Other students can request to rent it.</p>
              <Link className="ds-text-link" to="/listings">Manage your listings</Link>
            </div>
          ) : (
            <>
              <div className="ds-detail-save">
                <SavedItemsStatus />
                <SaveListingButton listing={listing} />
              </div>
              <form className="ds-rental-form" onSubmit={handleRequest}>
                <h2>Select rental dates</h2>
                <div className="ds-date-fields">
                  <label htmlFor="rental-start">
                    Pickup date
                    <input
                      className="ds-field"
                      id="rental-start"
                      type="date"
                      required
                      min={todayString}
                      value={startDate}
                      aria-invalid={pickupInvalid || undefined}
                      aria-describedby={pickupInvalid ? 'rental-dates-error' : undefined}
                      onChange={(event) => {
                        setStartDate(event.target.value)
                        setError('')
                      }}
                    />
                  </label>
                  <label htmlFor="rental-end">
                    Return date
                    <input
                      className="ds-field"
                      id="rental-end"
                      type="date"
                      required
                      min={startDate || todayString}
                      value={endDate}
                      aria-invalid={returnInvalid || undefined}
                      aria-describedby={returnInvalid ? 'rental-dates-error' : undefined}
                      onChange={(event) => {
                        setEndDate(event.target.value)
                        setError('')
                      }}
                    />
                  </label>
                </div>

                {days > 0 && (
                  <p className="ds-rental-estimate" aria-live="polite">
                    {days} {days === 1 ? 'day' : 'days'} · Estimated total: $
                    {(days * listing.price).toFixed(2)}
                  </p>
                )}
                {error && <p className="ds-date-error" id="rental-dates-error" role="alert">{error}</p>}
                <button className="ds-button ds-button--primary" type="submit">Request rental</button>
                <p className="ds-rental-note">Payment is arranged directly with the owner.</p>
              </form>
              <Link className="ds-text-link ds-report-link" to={`/report?listingId=${listing.id}`}>Report this listing</Link>
            </>
          )}
        </aside>
      </div>
    </main>
  )
}

export default ItemDetails
