import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDate, formatMoney } from '../../services/bookings'
import {
  closeItemRequest, getItemRequest, getOfferableListings, respondToRequest,
} from '../../services/itemRequests'
import { CURRENT_USER_ID, getUser } from '../../services/mockDataService'
import './requests.css'

// Request detail / respond (prototype m16). Responding opens a chat with the
// requester about one of your published listings.
function RequestDetail({ requestId }) {
  const navigate = useNavigate()
  const [request, setRequest] = useState(() => getItemRequest(requestId))
  const listings = getOfferableListings(CURRENT_USER_ID)
  const [form, setForm] = useState({
    listingId: listings[0]?.id ?? '',
    totalPrice: request?.targetPrice ?? '',
    message: '',
  })
  const [errors, setErrors] = useState({})

  if (!request) {
    return (
      <main className="page">
        <p>Request not found.</p>
        <Link to="/requests-board">Back to requests</Link>
      </main>
    )
  }

  const requester = getUser(request.requesterId)
  const isOwn = request.requesterId === CURRENT_USER_ID
  const isOpen = request.status === 'open'
  const price = request.targetPrice != null ? `Target ${formatMoney(request.targetPrice)}` : 'No target price'

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const respond = (withOffer) => {
    const found = {}
    if (!form.listingId) found.listingId = 'Choose one of your listings.'
    if (withOffer && (form.totalPrice === '' || !(Number(form.totalPrice) >= 0))) {
      found.totalPrice = 'Enter $0 or more.'
    }
    if (!withOffer && !form.message.trim()) found.message = 'Write a message to the requester.'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const conversationId = respondToRequest(request.id, CURRENT_USER_ID, {
      listingId: form.listingId,
      message: form.message,
      totalPrice: withOffer ? Number(form.totalPrice) : undefined,
    })
    if (conversationId) navigate(`/inbox?conversation=${conversationId}`)
    else setErrors({ form: 'This request can no longer be answered.' })
  }

  return (
    <main className="page">
      <Link to="/requests-board" className="request-back">← All requests</Link>

      <section className="request-summary">
        <p className="request-eyebrow">{isOwn ? 'Your request' : `${requester?.name} needs`}</p>
        <h1>{request.itemName}</h1>
        <p>
          {formatDate(request.neededBy)} – {formatDate(request.neededUntil)} · {price} · {request.approximateArea}
        </p>
        {request.details && <p>{request.details}</p>}
        {!isOpen && <p className="request-closed">This request is closed.</p>}
      </section>

      {isOwn && (
        <section>
          <h2>Replies</h2>
          {request.responses.length === 0 ? (
            <p>No replies yet. Students who can lend this item will message you.</p>
          ) : (
            <ul className="request-replies">
              {request.responses.map((response) => (
                <li key={response.conversationId}>
                  <span>{getUser(response.responderId)?.name}</span>
                  <Link to={`/inbox?conversation=${response.conversationId}`}>Open conversation</Link>
                </li>
              ))}
            </ul>
          )}
          {isOpen && (
            <div className="form-actions">
              <button type="button" onClick={() => setRequest(closeItemRequest(request.id))}>
                Close request
              </button>
            </div>
          )}
        </section>
      )}

      {!isOwn && isOpen && (listings.length === 0 ? (
        <p>
          You have no published listings to offer yet. <Link to="/listings/new">List an item</Link>
        </p>
      ) : (
        <form className="listing-form" onSubmit={(e) => { e.preventDefault(); respond(true) }} noValidate>
          <label>
            Item you can offer
            <select name="listingId" value={form.listingId} onChange={handleChange}
              className={errors.listingId ? 'has-error' : ''}>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title} · {formatMoney(listing.price)}/day
                </option>
              ))}
            </select>
            {errors.listingId && <span className="request-error">{errors.listingId}</span>}
          </label>

          <label>
            Amount for {formatDate(request.neededBy)} – {formatDate(request.neededUntil)} (0 = free)
            <span className="request-money">
              <input type="number" name="totalPrice" min="0" step="0.01" value={form.totalPrice}
                onChange={handleChange} className={errors.totalPrice ? 'has-error' : ''} />
            </span>
            {errors.totalPrice && <span className="request-error">{errors.totalPrice}</span>}
          </label>

          <label>
            Message
            <textarea name="message" rows="3" value={form.message} onChange={handleChange}
              placeholder="My projector is available for those dates."
              className={errors.message ? 'has-error' : ''} />
            {errors.message && <span className="request-error">{errors.message}</span>}
          </label>

          {errors.form && <p className="request-error">{errors.form}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-button">Send offer in chat</button>
            <button type="button" onClick={() => respond(false)}>Message requester</button>
          </div>
        </form>
      ))}
    </main>
  )
}

export default RequestDetail
