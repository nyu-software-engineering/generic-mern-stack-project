import { useState } from 'react'
import { flushSync } from 'react-dom'
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
    let validationError = ''
    if (!newEndDate) validationError = 'Pick a new return date.'
    else if (!isValidDate(newEndDate)) validationError = 'Enter a valid date.'
    else if (newEndDate <= booking.endDate) {
      validationError = `New return date must be after ${formatDate(booking.endDate)}.`
    } else if (newEndDate < todayISO()) {
      validationError = 'New return date cannot be in the past.'
    }
    if (validationError) {
      const field = e.currentTarget.elements.newEndDate
      flushSync(() => setError(validationError))
      field.focus()
      return
    }
    setError('')
    onSubmit(newEndDate)
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <label htmlFor="booking-extension-date">
        <span id="booking-extension-date-label">New return date</span>
        <input
          type="date"
          name="newEndDate"
          id="booking-extension-date"
          className="ds-field"
          aria-labelledby="booking-extension-date-label"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'booking-extension-date-error' : undefined}
          min={booking.endDate > todayISO() ? booking.endDate : todayISO()}
          value={newEndDate}
          onChange={(e) => {
            setNewEndDate(e.target.value)
            setError('')
          }}
        />
        {error && <span id="booking-extension-date-error" className="field-error" role="alert">{error}</span>}
      </label>
      {extraCost !== null && (
        <p className="booking-note">
          Extra cost: {formatMoney(extraCost)} · New total: {formatMoney(booking.totalPrice + extraCost)}
        </p>
      )}
      <button type="submit" className="ds-button ds-button--primary" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send extension request'}
      </button>
    </form>
  )
}

export default ExtensionRequestForm
