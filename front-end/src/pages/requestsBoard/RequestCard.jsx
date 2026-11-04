import { Link } from 'react-router-dom'
import { formatMoney, getListing } from '../../services/bookings'
import { getConversation, getLatestOffer } from '../../services/chat'
import { CURRENT_USER_ID, getUser } from '../../services/mockDataService'
import { REQUEST_TYPES } from '../../services/requestsBoard'

const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

// Summary of the newest reply to one of your item requests, e.g.
// "Omer offered Projector for $18.00." Returns null when there are no replies.
function latestReply(request) {
  const response = request.responses.at(-1)
  const conversation = response && getConversation(response.conversationId)
  if (!conversation) return null

  const name = getUser(response.responderId)?.name ?? 'Someone'
  const offer = getLatestOffer(conversation)
  const listing = getListing(conversation.listingId)
  return {
    conversationId: conversation.id,
    hasOffer: Boolean(offer),
    text: offer
      ? `${name} offered ${listing?.title ?? 'an item'} for ${formatMoney(offer.totalPrice)}.`
      : `${name} sent you a message.`,
  }
}

// One request on the board. Uses the shared rental-card styles from index.css.
function RequestCard({ request }) {
  const isItem = request.type === 'item'
  const isOwnRequest = request.requesterId === CURRENT_USER_ID

  let needed = `Needed by ${formatDate(request.neededBy)}`
  if (request.neededTime) needed += ` at ${request.neededTime}`
  if (isItem) needed = `Needed ${formatDate(request.neededBy)} – ${formatDate(request.neededUntil)}`

  // Your own item request (prototype m14): the newest reply and a link to that chat.
  if (isItem && isOwnRequest) {
    const reply = latestReply(request)
    return (
      <article className="rental-card">
        <div>
          <h3>{request.itemName}</h3>
          <p>{needed}</p>
          <p>{reply ? reply.text : 'No replies yet.'}</p>
          <div className="request-actions">
            {reply && (
              <Link to={`/inbox?conversation=${reply.conversationId}`}
                className="request-action request-action--primary">
                {reply.hasOffer ? 'View offer in Messages' : 'Open in Messages'}
              </Link>
            )}
            <Link to={`/requests?request=${request.id}`} className="request-action">
              Manage request
            </Link>
          </div>
        </div>
        <span className="rental-status">{REQUEST_TYPES[request.type]}</span>
      </article>
    )
  }

  const requester = isItem ? getUser(request.requesterId) : null

  return (
    <article className="rental-card">
      <div>
        <h3>{request.itemName}</h3>
        {requester && <p>Posted by {requester.name}</p>}
        <p>{needed}</p>
        {request.borrowDuration && <p>For {request.borrowDuration}</p>}
        <p>Area: {request.approximateArea}</p>
        {isItem && request.targetPrice != null && <p>Target: {formatMoney(request.targetPrice)}</p>}
        {request.details && <p>{request.details}</p>}
        {isItem ? (
          <Link to={`/requests?request=${request.id}`} className="request-action">
            View request / offer an item
          </Link>
        ) : (
          !isOwnRequest && <Link to="/inbox" className="request-action">Message</Link>
        )}
      </div>
      <span className="rental-status">{REQUEST_TYPES[request.type]}</span>
    </article>
  )
}

export default RequestCard
