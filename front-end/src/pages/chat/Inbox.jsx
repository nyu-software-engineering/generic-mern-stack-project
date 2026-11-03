import { Link, useSearchParams } from 'react-router-dom'
import Conversation from './Conversation'
import { CURRENT_USER_ID, formatDate, getListing, listingImage } from '../../services/bookings'
import {
  formatSentAt, getConversations, getLastMessage, getOtherParticipant,
} from '../../services/chat'
import './chat.css'

function previewText(message) {
  const mine = message.senderId === CURRENT_USER_ID
  if (message.type === 'offer') {
    const label = mine ? 'You offered' : 'Offer received'
    return `${label}: $${message.totalPrice} for ${formatDate(message.startDate)} – ${formatDate(message.endDate)}`
  }
  return mine ? `You: ${message.text}` : message.text
}

// Messages list (prototype m18). /inbox?conversation=<id> opens one conversation (m19).
function Inbox() {
  const [searchParams] = useSearchParams()
  const conversationId = searchParams.get('conversation')

  if (conversationId) {
    return <Conversation key={conversationId} conversationId={conversationId} />
  }

  const conversations = getConversations(CURRENT_USER_ID)

  return (
    <main className="chat-page">
      <h1>Messages</h1>
      {conversations.length === 0 ? (
        <p className="chat-empty">No conversations yet.</p>
      ) : (
        conversations.map((c) => {
          const listing = getListing(c.listingId)
          const other = getOtherParticipant(c, CURRENT_USER_ID)
          const last = getLastMessage(c)
          return (
            <Link key={c.id} to={`/inbox?conversation=${c.id}`} className="chat-card chat-row">
              <img src={listingImage(listing.id, 96)} alt={listing.title} />
              <div className="chat-row-text">
                <h2>{other?.name}</h2>
                <p className="chat-item-title">{listing.title}</p>
                <p className="chat-preview">{previewText(last)}</p>
              </div>
              <span className="chat-row-time">{formatSentAt(last.sentAt)}</span>
            </Link>
          )
        })
      )}
    </main>
  )
}

export default Inbox
