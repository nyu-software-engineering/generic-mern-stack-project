import { useState } from 'react'
import { ITEM_CONDITIONS } from '../../services/bookings'

// Condition, accessories and notes recorded when an item changes hands (#54).
function HandoffCheckForm({ conditionLabel, accessoriesLabel, submitLabel, onSubmit }) {
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const { condition, accessoriesComplete, notes } = e.currentTarget.elements
    if (!condition.value) return setError('Choose the item condition.')
    setError('')
    onSubmit({
      condition: condition.value,
      accessoriesComplete: accessoriesComplete.checked,
      notes: notes.value,
    })
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} onChange={() => setError('')} noValidate>
      <label>
        {conditionLabel}
        <select name="condition" defaultValue="" className={error ? 'has-error' : ''}>
          <option value="" disabled>Select condition</option>
          {ITEM_CONDITIONS.map((condition) => <option key={condition}>{condition}</option>)}
        </select>
        {error && <p className="field-error">{error}</p>}
      </label>

      <label className="booking-check">
        <input type="checkbox" name="accessoriesComplete" />
        {accessoriesLabel}
      </label>

      <label>
        Notes (optional)
        <textarea name="notes" placeholder="Anything to note about the item" />
      </label>

      <button type="submit" className="booking-btn booking-btn--primary">{submitLabel}</button>
    </form>
  )
}

export default HandoffCheckForm
