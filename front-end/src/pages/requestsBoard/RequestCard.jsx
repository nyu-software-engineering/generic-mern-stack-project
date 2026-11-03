import { Link } from 'react-router-dom'
import { REQUEST_TYPES } from '../../services/requestsBoard'

const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

// One request on the board. Uses the shared rental-card styles from index.css.
function RequestCard({ request }) {
  const needed = request.neededTime
    ? `${formatDate(request.neededBy)} at ${request.neededTime}`
    : formatDate(request.neededBy)

  return (
    <article className="rental-card">
      <div>
        <h3>{request.itemName}</h3>
        <p>Needed by {needed}</p>
        {request.borrowDuration && <p>For {request.borrowDuration}</p>}
        <p>Area: {request.approximateArea}</p>
        <p>{request.details}</p>
        <Link to="/inbox" className="request-action">Message</Link>
      </div>
      <span className="rental-status">{REQUEST_TYPES[request.type]}</span>
    </article>
  )
}

export default RequestCard
