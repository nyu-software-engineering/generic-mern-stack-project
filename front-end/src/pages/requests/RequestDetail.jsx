import { useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { formatDate, formatMoney } from '../../services/bookings'
import {
  closeItemRequest, getItemRequest, getOfferableListings, respondToRequest,
} from '../../services/itemRequests'
import { CURRENT_USER_ID, getUser } from '../../services/mockDataService'
import './requests.css'
import '../../styles/messages.css'

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
      <main className="ds-page ds-messages">
        <h1 className="ds-heading">Request not found</h1>
        <Link className="ds-text-link" to="/requests-board">Back to requests</Link>
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
    if (Object.keys(found).length > 0) {
      flushSync(() => setErrors(found))
      document.getElementById('request-response-' + Object.keys(found)[0])?.focus()
      return
    }
    setErrors(found)

    const conversationId = respondToRequest(request.id, CURRENT_USER_ID, {
      listingId: form.listingId,
      message: form.message,
      totalPrice: withOffer ? Number(form.totalPrice) : undefined,
    })
    if (conversationId) navigate(`/inbox?conversation=${conversationId}`)
    else setErrors({ form: 'This request can no longer be answered.' })
  }

  return (
    <main className="ds-page ds-messages">
      <Link to="/requests-board" className="ds-text-link">All requests</Link>

      <section className="ds-message-surface request-summary">
        <p className="request-eyebrow">{isOwn ? 'Your request' : `${requester?.name} needs`}</p>
        <h1 className="ds-heading">{request.itemName}</h1>
        <p>
          {formatDate(request.neededBy)} to {formatDate(request.neededUntil)} · {price} · {request.approximateArea}
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
                  <Link className="ds-text-link" to={`/inbox?conversation=${response.conversationId}`}>Open conversation</Link>
                </li>
              ))}
            </ul>
          )}
          {isOpen && (
            <div className="ds-message-actions">
              <button className="ds-button ds-message-danger" type="button" onClick={() => setRequest(closeItemRequest(request.id))}>
                Close request
              </button>
            </div>
          )}
        </section>
      )}

      {!isOwn && isOpen && (listings.length === 0 ? (
        <p>
          You have no published listings to offer yet. <Link className="ds-text-link" to="/listings/new">List an item</Link>
        </p>
      ) : (
        <form className="ds-message-form ds-message-surface" onSubmit={(e) => { e.preventDefault(); respond(true) }} noValidate>
          <label>
            <span id="request-response-listingId-label">Item you can offer</span>
            <select name="listingId" id="request-response-listingId" aria-labelledby="request-response-listingId-label" aria-invalid={Boolean(errors.listingId) || undefined} aria-describedby={errors.listingId ? 'request-response-listingId-error' : undefined} value={form.listingId} onChange={handleChange}
              className="ds-field">
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title} · {formatMoney(listing.price)}/day
                </option>
              ))}
            </select>
            {errors.listingId && <span className="ds-message-error" id="request-response-listingId-error" role="alert">{errors.listingId}</span>}
          </label>

          <label>
            <span id="request-response-totalPrice-label">Amount for {formatDate(request.neededBy)} to {formatDate(request.neededUntil)} (0 = free)</span>
            <span className="request-money">
              <input type="number" name="totalPrice" id="request-response-totalPrice" aria-labelledby="request-response-totalPrice-label" aria-invalid={Boolean(errors.totalPrice) || undefined} aria-describedby={errors.totalPrice ? 'request-response-totalPrice-error' : undefined} min="0" step="0.01" value={form.totalPrice}
                onChange={handleChange} className="ds-field" />
            </span>
            {errors.totalPrice && <span className="ds-message-error" id="request-response-totalPrice-error" role="alert">{errors.totalPrice}</span>}
          </label>

          <label>
            <span id="request-response-message-label">Message</span>
            <textarea name="message" id="request-response-message" aria-labelledby="request-response-message-label" aria-invalid={Boolean(errors.message) || undefined} aria-describedby={errors.message ? 'request-response-message-error' : undefined} rows="3" value={form.message} onChange={handleChange}
              placeholder="My projector is available for those dates."
              className="ds-field" />
            {errors.message && <span className="ds-message-error" id="request-response-message-error" role="alert">{errors.message}</span>}
          </label>

          {errors.form && <p className="ds-feedback ds-feedback--error" role="alert">{errors.form}</p>}

          <div className="ds-message-actions">
            <button type="submit" className="ds-button ds-button--primary">Send offer in chat</button>
            <button className="ds-button ds-button--secondary" type="button" onClick={() => respond(false)}>Message requester</button>
          </div>
        </form>
      ))}
    </main>
  )
}

export default RequestDetail
