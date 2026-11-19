import { useState } from 'react'
import { flushSync } from 'react-dom'
import { countDays, formatMoney, roundCents } from '../../services/bookings'

const todayISO = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

// True only for a real calendar date in YYYY-MM-DD form (rejects "zzz", "2026-02-30").
function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function validate({ startDate, endDate }) {
  const errors = {}
  if (!startDate) errors.startDate = 'Pick a start date.'
  else if (!isValidDate(startDate)) errors.startDate = 'Enter a valid start date.'
  else if (startDate < todayISO()) errors.startDate = 'Start date cannot be in the past.'
  if (!endDate) errors.endDate = 'Pick a return date.'
  else if (!isValidDate(endDate)) errors.endDate = 'Enter a valid return date.'
  else if (!errors.startDate && endDate <= startDate) errors.endDate = 'Return date must be after the start date.'
  return errors
}

// onSubmit receives { startDate, endDate, message } and may return a promise.
// If it rejects, the error message is shown and the form stays filled in.
function BookingForm({ listing, initialStart = '', initialEnd = '', onSubmit }) {
  const [form, setForm] = useState({
    // Ignore prefilled dates from the URL unless they are real dates.
    startDate: isValidDate(initialStart) ? initialStart : '',
    endDate: isValidDate(initialEnd) ? initialEnd : '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const days = isValidDate(form.startDate) && isValidDate(form.endDate)
    ? countDays(form.startDate, form.endDate)
    : 0
  // The server calculates the total the same way: days × daily price.
  const total = days > 0 ? roundCents(days * listing.price) : null

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setSubmitError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const found = validate(form)
    if (found.startDate || found.endDate) {
      const field = e.currentTarget.elements[found.startDate ? 'startDate' : 'endDate']
      flushSync(() => setErrors(found))
      field.focus()
      return
    }

    setErrors(found)
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({ startDate: form.startDate, endDate: form.endDate, message: form.message.trim() })
    } catch (error) {
      setSubmitError(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <div className="booking-dates">
        <label htmlFor="booking-start-date">
          <span id="booking-start-date-label">Start date</span>
          <input type="date" name="startDate" id="booking-start-date" className="ds-field"
            min={todayISO()} value={form.startDate} onChange={handleChange}
            aria-labelledby="booking-start-date-label" aria-invalid={errors.startDate ? true : undefined}
            aria-describedby={errors.startDate ? 'booking-start-date-error' : undefined} />
          {errors.startDate && <span id="booking-start-date-error" className="field-error" role="alert">{errors.startDate}</span>}
        </label>
        <label htmlFor="booking-end-date">
          <span id="booking-end-date-label">Return date</span>
          <input type="date" name="endDate" id="booking-end-date" className="ds-field"
            min={form.startDate || todayISO()} value={form.endDate} onChange={handleChange}
            aria-labelledby="booking-end-date-label" aria-invalid={errors.endDate ? true : undefined}
            aria-describedby={errors.endDate ? 'booking-end-date-error' : undefined} />
          {errors.endDate && <span id="booking-end-date-error" className="field-error" role="alert">{errors.endDate}</span>}
        </label>
      </div>

      <p className="booking-note">
        {total === null
          ? `${formatMoney(listing.price)} per day. Pick your dates to see the total.`
          : `Total: ${formatMoney(total)} (${days} day${days > 1 ? 's' : ''} × ${formatMoney(listing.price)})`}
      </p>

      <label htmlFor="booking-message">
        <span id="booking-message-label">Message to owner</span>
        <textarea name="message" id="booking-message" className="ds-field" aria-labelledby="booking-message-label"
          rows={3} value={form.message} onChange={handleChange}
          placeholder="e.g. For a small indoor event" />
      </label>

      <p className="booking-note">Payment is arranged directly with the owner.</p>
      {submitError && <p className="field-error" role="alert">Could not send request. {submitError.message}</p>}
      <button type="submit" className="ds-button ds-button--primary" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send request'}
      </button>
    </form>
  )
}

export default BookingForm
