import { useState } from 'react'
import { Link } from 'react-router-dom'
import RequestCard from './RequestCard'
import { REQUEST_TYPES, getBoardRequests } from '../../services/requestsBoard'
import './requestsBoard.css'

const TABS = [['all', 'All'], ...Object.entries(REQUEST_TYPES)]

// Shared board of item requests and quick borrow requests.
function RequestsBoard() {
  const [type, setType] = useState('all')
  const requests = getBoardRequests(type)

  return (
    <main className="page">
      <header className="page-header">
        <h1>Requests</h1>
        <Link to="/quick-borrow" className="request-action request-action--primary">
          Post a quick borrow
        </Link>
      </header>

      <div className="request-tabs" role="tablist" aria-label="Request type">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={type === value}
            className={type === value ? 'request-tab request-tab--active' : 'request-tab'}
            onClick={() => setType(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <div className="rental-grid">
          {requests.map((request) => (
            <RequestCard key={`${request.type}-${request.id}`} request={request} />
          ))}
        </div>
      )}
    </main>
  )
}

export default RequestsBoard
