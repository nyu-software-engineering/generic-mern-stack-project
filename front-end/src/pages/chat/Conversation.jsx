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

// One conversation with messages and rental offers (prototype m19, offer overlay m20).
function Conversation({ conversationId }) {
  const navigate = useNavigate()
  const [conversation, setConversation] = useState(() => getConversation(conversationId))
  const [draft, setDraft] = useState('')
  const [offerFormOpen, setOfferFormOpen] = useState(false)

  if (!conversation) {
    return (
      <main className="chat-page">
        <p>Conversation not found.</p>
        <Link to="/inbox" className="chat-btn">Back to messages</Link>
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
    <main className="chat-page">
      <Link to="/inbox" className="chat-back">← Messages</Link>

      <div className="chat-card chat-row">
        <img src={listingImage(listing.id, 96)} alt={listing.title} />
        <div className="chat-row-text">
          <h2>{other?.name}</h2>
          <p className="chat-item-title">{listing.title}</p>
          <p>Verified NYU · {other?.completedRentals ?? 0} completed rentals · ${listing.price}/day</p>
        </div>
      </div>

      <ol className="chat-messages">
        {conversation.messages.map((m) => {
          const mine = m.senderId === CURRENT_USER_ID
          return (
            <li key={m.id} className={mine ? 'chat-message chat-message--mine' : 'chat-message'}>
              {m.type === 'offer' ? (
                <div className={`chat-offer chat-offer--${m.status}`}>
                  <h3>Rental offer · ${m.totalPrice} total</h3>
                  <p>{formatDate(m.startDate)} – {formatDate(m.endDate)}</p>
                  <p className="chat-offer-status">
                    {OFFER_STATUS_LABELS[m.status]}
                    {m.bookingId && <> · <Link to={`/bookings/${m.bookingId}`}>View booking</Link></>}
                  </p>
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
          <button type="button" className="chat-btn chat-btn--primary" onClick={handleAccept}>
            Accept and view booking
          </button>
        )}
        <button type="button" className="chat-btn" onClick={() => setOfferFormOpen(true)}>
          {latestOffer ? 'Make / counter offer' : 'Make an offer'}
        </button>
        {canRespond && (
          <button
            type="button"
            className="chat-btn chat-btn--link"
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
            placeholder="Write a message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="chat-btn chat-btn--primary" disabled={!draft.trim()}>
            Send
          </button>
        </div>
      </form>

      <Link to="/report" className="chat-report">Report conversation</Link>

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
