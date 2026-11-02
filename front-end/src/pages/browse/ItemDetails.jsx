import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getListing, getUser } from '../../services/bookings'

function ItemDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')

  const listing = getListing(id)

  if (!listing || listing.status !== 'published') {
    return (
      <main className="item-details-page">
        <h1>Item unavailable</h1>
        <p>This listing could not be found or is no longer published.</p>
        <Link to="/browse">Back to browse</Link>
      </main>
    )
  }

  const owner = getUser(listing.ownerId)

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
      <p>{listing.description}</p>
      <p>Owner: {owner?.name ?? 'Student owner'}</p>
      <p>${listing.price.toFixed(2)} / day</p>

      <section>
        <h2>Rental terms</h2>
        <p>{listing.rentalTerms}</p>
      </section>

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
    </main>
  )
}

export default ItemDetails