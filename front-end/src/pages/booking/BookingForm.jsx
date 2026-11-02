import { useState } from 'react'
import { countDays } from '../../services/bookings'

const todayISO = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

// True only for a real calendar date in YYYY-MM-DD form (rejects "zzz", "2026-02-30").
function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function validate({ startDate, endDate, totalPrice }) {
  const errors = {}
  if (!startDate) errors.startDate = 'Pick a start date.'
  else if (!isValidDate(startDate)) errors.startDate = 'Enter a valid start date.'
  else if (startDate < todayISO()) errors.startDate = 'Start date cannot be in the past.'
  if (!endDate) errors.endDate = 'Pick a return date.'
  else if (!isValidDate(endDate)) errors.endDate = 'Enter a valid return date.'
  else if (!errors.startDate && endDate <= startDate) errors.endDate = 'Return date must be after the start date.'
  if (!errors.startDate && !errors.endDate && (totalPrice === '' || Number(totalPrice) <= 0)) errors.totalPrice = 'Enter a total above $0.'
  return errors
}

function BookingForm({ listing, initialStart = '', initialEnd = '', onSubmit }) {
  const [form, setForm] = useState({
    // Ignore prefilled dates from the URL unless they are real dates.
    startDate: isValidDate(initialStart) ? initialStart : '',
    endDate: isValidDate(initialEnd) ? initialEnd : '',
    message: '',
  })
  const [customTotal, setCustomTotal] = useState(null) // null = use the suggested total
  const [errors, setErrors] = useState({})

  const days = isValidDate(form.startDate) && isValidDate(form.endDate)
    ? countDays(form.startDate, form.endDate)
    : 0
  const suggestedTotal = days > 0 ? days * listing.price : ''
  const totalPrice = customTotal ?? suggestedTotal

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validate({ ...form, totalPrice })
    setErrors(found)
    if (Object.keys(found).length === 0) {
      onSubmit({ ...form, totalPrice: Number(totalPrice), message: form.message.trim() })
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      <div className="booking-dates">
        <label>
          Start date
          <input type="date" name="startDate" min={todayISO()} value={form.startDate}
            onChange={handleChange} className={errors.startDate ? 'has-error' : ''} />
          {errors.startDate && <p className="field-error">{errors.startDate}</p>}
        </label>
        <label>
          Return date
          <input type="date" name="endDate" min={form.startDate || todayISO()} value={form.endDate}
            onChange={handleChange} className={errors.endDate ? 'has-error' : ''} />
          {errors.endDate && <p className="field-error">{errors.endDate}</p>}
        </label>
      </div>

      <label>
        Proposed total ($)
        <input type="number" min="1" value={totalPrice}
          onChange={(e) => setCustomTotal(e.target.value)}
          className={errors.totalPrice ? 'has-error' : ''} />
        {days > 0 && (
          <span className="booking-note">
            Suggested: ${suggestedTotal} ({days} day{days > 1 ? 's' : ''} × ${listing.price})
          </span>
        )}
        {errors.totalPrice && <p className="field-error">{errors.totalPrice}</p>}
      </label>

      <label>
        Message to owner
        <textarea name="message" rows={3} value={form.message} onChange={handleChange}
          placeholder="e.g. For a small indoor event" />
      </label>

      <p className="booking-note">Payment is arranged directly with the owner.</p>
      <button type="submit" className="booking-btn booking-btn--primary">Send request</button>
    </form>
  )
}

export default BookingForm
