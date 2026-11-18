import { useState } from 'react'
import { extensionCost, formatDate, formatMoney, todayISO } from '../../services/bookings'

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

// Borrower picks a later return date for an active rental (#55).
function ExtensionRequestForm({ booking, onSubmit, submitting = false }) {
  const [newEndDate, setNewEndDate] = useState('')
  const [error, setError] = useState('')

  const extraCost = isValidDate(newEndDate) && newEndDate > booking.endDate
    ? extensionCost(booking, newEndDate)
    : null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newEndDate) return setError('Pick a new return date.')
    if (!isValidDate(newEndDate)) return setError('Enter a valid date.')
    if (newEndDate <= booking.endDate) {
      return setError(`New return date must be after ${formatDate(booking.endDate)}.`)
    }
    if (newEndDate < todayISO()) return setError('New return date cannot be in the past.')
    setError('')
    onSubmit(newEndDate)
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      <label>
        New return date
        <input
          type="date"
          min={booking.endDate > todayISO() ? booking.endDate : todayISO()}
          value={newEndDate}
          onChange={(e) => { setNewEndDate(e.target.value); setError('') }}
          className={error ? 'has-error' : ''}
        />
        {error && <p className="field-error">{error}</p>}
      </label>
      {extraCost !== null && (
        <p className="booking-note">
          Extra cost: {formatMoney(extraCost)} · New total: {formatMoney(booking.totalPrice + extraCost)}
        </p>
      )}
      <button type="submit" className="booking-btn booking-btn--primary" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send extension request'}
      </button>
    </form>
  )
}

export default ExtensionRequestForm
