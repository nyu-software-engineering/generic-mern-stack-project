import './StatusBadge.css'

// Shared pill for booking statuses (and the derived "overdue" state).
function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default StatusBadge
