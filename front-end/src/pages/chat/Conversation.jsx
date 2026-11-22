import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OfferForm from './OfferForm'
import { CURRENT_USER_ID, formatDate, getListing, listingImage } from '../../services/bookings'
import {
  acceptOffer, declineOffer, formatSentAt, getConversation, getLatestOffer,
  getOtherParticipant, getPendingOffer, sendMessage, sendOffer,
} from '../../services/chat'

const OFFER_STATUS_LABELS = {
  pending: 'Waiting for reply',
  accepted: 'Accepted',
  declined: 'Declined',
  countered: 'Replaced by a new offer',
}

// One conversation with messages and rental offers (prototype m19, offer dialog m20).
function Conversation({ conversationId }) {
  const navigate = useNavigate()
  const [conversation, setConversation] = useState(() => getConversation(conversationId))
  const [draft, setDraft] = useState('')
  const [offerFormOpen, setOfferFormOpen] = useState(false)

  if (!conversation) {
    return (
      <main className="ds-page ds-messages chat-page">
        <h1 className="ds-heading">Conversation</h1>
        <p className="ds-feedback">Conversation not found.</p>
        <Link to="/inbox" className="ds-text-link">Back to messages</Link>
      </main>
    )
  }

  const listing = getListing(conversation.listingId)
  const other = getOtherParticipant(conversation, CURRENT_USER_ID)
  const pendingOffer = getPendingOffer(conversation)
  const latestOffer = getLatestOffer(conversation)
  const canRespond = pendingOffer && pendingOffer.senderId !== CURRENT_USER_ID

  const handleSend = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setConversation(sendMessage(conversation.id, CURRENT_USER_ID, text))
    setDraft('')
  }

  const handleOffer = (offer) => {
    setConversation(sendOffer(conversation.id, CURRENT_USER_ID, offer))
    setOfferFormOpen(false)
  }

  const handleAccept = () => {
    const booking = acceptOffer(conversation.id, pendingOffer.id)
    navigate(`/bookings/${booking.id}`)
  }

  return (
    <main className="ds-page ds-messages chat-page">
      <Link to="/inbox" className="ds-text-link">← Messages</Link>
      <h1 className="ds-heading">Conversation</h1>

      <div className="ds-message-surface chat-card chat-row">
        <img src={listingImage(listing.id, 96)} alt={listing.title} />
        <div className="chat-row-text">
          <h2>{other?.name}</h2>
          <p className="chat-item-title">{listing.title}</p>
          <p className="chat-time">
            {other?.completedRentals != null && <>{other.completedRentals} completed rentals · </>}
            ${listing.price}/day
          </p>
        </div>
      </div>

      <ol className="chat-messages">
        {conversation.messages.map((m) => {
          const mine = m.senderId === CURRENT_USER_ID
          return (
            <li key={m.id} className={mine ? 'chat-message chat-message--mine' : 'chat-message'}>
              {m.type === 'offer' ? (
                <div className={`ds-message-surface chat-offer chat-offer--${m.status}`}>
                  <h3>Rental offer · ${m.totalPrice} total</h3>
                  <p>{formatDate(m.startDate)} – {formatDate(m.endDate)}</p>
                  <div className="chat-offer-status">
                    <span className="ds-status">{OFFER_STATUS_LABELS[m.status]}</span>
                    {m.bookingId && <Link to={`/bookings/${m.bookingId}`} className="ds-text-link">View booking</Link>}
                  </div>
                </div>
              ) : (
                <p className="chat-bubble">{m.text}</p>
              )}
              <span className="chat-time">{mine ? 'You' : other?.name} · {formatSentAt(m.sentAt)}</span>
            </li>
          )
        })}
      </ol>

      <div className="chat-actions">
        {canRespond && (
          <button type="button" className="ds-button ds-button--primary" onClick={handleAccept}>
            Accept and view booking
          </button>
        )}
        <button type="button" className="ds-button ds-button--secondary" onClick={(e) => {
          e.currentTarget.focus()
          setOfferFormOpen(true)
        }}>
          {latestOffer ? 'Make / counter offer' : 'Make an offer'}
        </button>
        {canRespond && (
          <button
            type="button"
            className="ds-button ds-button--secondary ds-message-danger"
            onClick={() => setConversation(declineOffer(conversation.id, pendingOffer.id))}
          >
            Decline offer
          </button>
        )}
      </div>

      <form className="chat-send" onSubmit={handleSend}>
        <label htmlFor="chat-message">Message</label>
        <div className="chat-send-row">
          <input
            id="chat-message"
            className="ds-field"
            placeholder="Write a message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="ds-button ds-button--primary" disabled={!draft.trim()}>
            Send
          </button>
        </div>
      </form>

      <Link to={`/report?conversationId=${conversation.id}`} className="ds-text-link">Report conversation</Link>

      {offerFormOpen && (
        <OfferForm
          listing={listing}
          initialOffer={latestOffer}
          onSubmit={handleOffer}
          onCancel={() => setOfferFormOpen(false)}
        />
      )}
    </main>
  )
}

export default Conversation
