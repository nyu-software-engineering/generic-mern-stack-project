import { useState } from 'react'
import { countDays } from '../../services/bookings'

const todayISO = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

function validate({ startDate, endDate, totalPrice }) {
  const errors = {}
  if (!startDate) errors.startDate = 'Pick a start date.'
  else if (startDate < todayISO()) errors.startDate = 'Start date cannot be in the past.'
  if (!endDate) errors.endDate = 'Pick a return date.'
  else if (!errors.startDate && endDate <= startDate) errors.endDate = 'Return date must be after the start date.'
  if (totalPrice === '' || Number(totalPrice) < 0) errors.totalPrice = 'Enter a total of $0 or more.'
  return errors
}

// Offer / counter-offer overlay (prototype m20). Prefills from the latest offer.
function OfferForm({ listing, initialOffer, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    totalPrice: initialOffer?.totalPrice ?? '',
    startDate: initialOffer?.startDate ?? '',
    endDate: initialOffer?.endDate ?? '',
  })
  const [errors, setErrors] = useState({})

  const days = form.startDate && form.endDate ? countDays(form.startDate, form.endDate) : 0

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSubmit({ ...form, totalPrice: Number(form.totalPrice) })
  }

  return (
    <div className="chat-overlay" onClick={onCancel}>
      <form className="chat-card chat-offer-form" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} noValidate>
        <h2>Offer / counter-offer</h2>

        <label>
          Total amount ($)
          <input name="totalPrice" type="number" min="0" value={form.totalPrice} onChange={handleChange}
            className={errors.totalPrice ? 'has-error' : ''} />
          {errors.totalPrice && <span className="chat-error">{errors.totalPrice}</span>}
        </label>
        {days > 0 && (
          <p className="chat-note">Listed price for {days} day{days === 1 ? '' : 's'}: ${days * listing.price}</p>
        )}

        <div className="chat-dates">
          <label>
            Start date
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange}
              className={errors.startDate ? 'has-error' : ''} />
            {errors.startDate && <span className="chat-error">{errors.startDate}</span>}
          </label>
          <label>
            Return date
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange}
              className={errors.endDate ? 'has-error' : ''} />
            {errors.endDate && <span className="chat-error">{errors.endDate}</span>}
          </label>
        </div>

        <button type="submit" className="chat-btn chat-btn--primary">Send offer</button>
        <button type="button" className="chat-btn" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  )
}

export default OfferForm
