import { useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { todayISO } from '../../services/bookings'
import { postItemRequest } from '../../services/itemRequests'
import './requests.css'
import '../../styles/messages.css'

const emptyForm = {
  itemName: '',
  neededBy: '',
  neededUntil: '',
  approximateArea: '',
  targetPrice: '',
  details: '',
}

// Create Item Request (prototype m15).
function CreateItemRequest() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = postItemRequest(form)
    if (result.errors) {
      flushSync(() => setErrors(result.errors))
      e.currentTarget.elements[Object.keys(result.errors)[0]]?.focus()
      return
    }
    navigate('/requests-board')
  }

  return (
    <main className="ds-page ds-messages">
      <Link to="/requests-board" className="ds-text-link">All requests</Link>
      <h1 className="ds-heading">Create item request</h1>

      <form className="ds-message-form ds-message-surface" onSubmit={handleSubmit} noValidate>
        <label>
            <span id="request-create-itemName-label">What do you need?</span>
            <input name="itemName" id="request-create-itemName" aria-labelledby="request-create-itemName-label" aria-invalid={Boolean(errors.itemName) || undefined} aria-describedby={errors.itemName ? 'request-create-itemName-error' : undefined} value={form.itemName} onChange={handleChange}
            placeholder="Portable projector" className="ds-field" />
          {errors.itemName && <span className="ds-message-error" id="request-create-itemName-error" role="alert">{errors.itemName}</span>}
        </label>

        <div className="request-dates">
          <label>
            <span id="request-create-neededBy-label">Needed from</span>
            <input type="date" name="neededBy" id="request-create-neededBy" aria-labelledby="request-create-neededBy-label" aria-invalid={Boolean(errors.neededBy) || undefined} aria-describedby={errors.neededBy ? 'request-create-neededBy-error' : undefined} min={todayISO()} value={form.neededBy}
              onChange={handleChange} className="ds-field" />
            {errors.neededBy && <span className="ds-message-error" id="request-create-neededBy-error" role="alert">{errors.neededBy}</span>}
          </label>
          <label>
            <span id="request-create-neededUntil-label">Needed until</span>
            <input type="date" name="neededUntil" id="request-create-neededUntil" aria-labelledby="request-create-neededUntil-label" aria-invalid={Boolean(errors.neededUntil) || undefined} aria-describedby={errors.neededUntil ? 'request-create-neededUntil-error' : undefined} min={form.neededBy || todayISO()} value={form.neededUntil}
              onChange={handleChange} className="ds-field" />
            {errors.neededUntil && <span className="ds-message-error" id="request-create-neededUntil-error" role="alert">{errors.neededUntil}</span>}
          </label>
        </div>

        <label>
            <span id="request-create-approximateArea-label">Approximate area</span>
            <input name="approximateArea" id="request-create-approximateArea" aria-labelledby="request-create-approximateArea-label" aria-invalid={Boolean(errors.approximateArea) || undefined} aria-describedby={errors.approximateArea ? 'request-create-approximateArea-error' : undefined} value={form.approximateArea} onChange={handleChange}
            placeholder="Near Third North" className="ds-field" />
          {errors.approximateArea && <span className="ds-message-error" id="request-create-approximateArea-error" role="alert">{errors.approximateArea}</span>}
        </label>

        <label>
            <span id="request-create-targetPrice-label">Target price in dollars (optional)</span>
            <span className="request-money">
            <input type="number" name="targetPrice" id="request-create-targetPrice" aria-labelledby="request-create-targetPrice-label" aria-invalid={Boolean(errors.targetPrice) || undefined} aria-describedby={errors.targetPrice ? 'request-create-targetPrice-error' : undefined} min="0" step="0.01" value={form.targetPrice}
              onChange={handleChange} placeholder="18.00" className="ds-field" />
          </span>
          {errors.targetPrice && <span className="ds-message-error" id="request-create-targetPrice-error" role="alert">{errors.targetPrice}</span>}
        </label>

        <label>
            <span id="request-create-details-label">Additional details (optional)</span>
            <textarea className="ds-field" name="details" id="request-create-details" aria-labelledby="request-create-details-label" rows="3" value={form.details} onChange={handleChange}
            placeholder="For a small indoor event" />
        </label>

        <div className="ds-message-actions">
          <button type="submit" className="ds-button ds-button--primary">Post request</button>
        </div>
      </form>
    </main>
  )
}

export default CreateItemRequest
