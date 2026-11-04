import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { todayISO } from '../../services/bookings'
import { postItemRequest } from '../../services/itemRequests'
import './requests.css'

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
      setErrors(result.errors)
      return
    }
    navigate('/requests-board')
  }

  const fieldClass = (name) => (errors[name] ? 'has-error' : '')

  return (
    <main className="page">
      <Link to="/requests-board" className="request-back">← All requests</Link>
      <h1>Create item request</h1>

      <form className="listing-form" onSubmit={handleSubmit} noValidate>
        <label>
          What do you need?
          <input name="itemName" value={form.itemName} onChange={handleChange}
            placeholder="Portable projector" className={fieldClass('itemName')} />
          {errors.itemName && <span className="request-error">{errors.itemName}</span>}
        </label>

        <div className="request-dates">
          <label>
            Needed from
            <input type="date" name="neededBy" min={todayISO()} value={form.neededBy}
              onChange={handleChange} className={fieldClass('neededBy')} />
            {errors.neededBy && <span className="request-error">{errors.neededBy}</span>}
          </label>
          <label>
            Needed until
            <input type="date" name="neededUntil" min={form.neededBy || todayISO()} value={form.neededUntil}
              onChange={handleChange} className={fieldClass('neededUntil')} />
            {errors.neededUntil && <span className="request-error">{errors.neededUntil}</span>}
          </label>
        </div>

        <label>
          Approximate area
          <input name="approximateArea" value={form.approximateArea} onChange={handleChange}
            placeholder="Near Third North" className={fieldClass('approximateArea')} />
          {errors.approximateArea && <span className="request-error">{errors.approximateArea}</span>}
        </label>

        <label>
          Target price (optional)
          <span className="request-money">
            <input type="number" name="targetPrice" min="0" step="0.01" value={form.targetPrice}
              onChange={handleChange} placeholder="18.00" className={fieldClass('targetPrice')} />
          </span>
          {errors.targetPrice && <span className="request-error">{errors.targetPrice}</span>}
        </label>

        <label>
          Additional details (optional)
          <textarea name="details" rows="3" value={form.details} onChange={handleChange}
            placeholder="For a small indoor event" />
        </label>

        <div className="form-actions">
          <button type="submit" className="primary-button">Post request</button>
        </div>
      </form>
    </main>
  )
}

export default CreateItemRequest
