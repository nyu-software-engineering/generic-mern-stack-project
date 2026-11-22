import { useState } from 'react'
import { flushSync } from 'react-dom'
import { ITEM_CONDITIONS } from '../../services/bookings'

// Condition, accessories and notes recorded when an item changes hands (#54).
function HandoffCheckForm({ conditionLabel, accessoriesLabel, submitLabel, onSubmit, pending = false }) {
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const { condition, accessoriesComplete, notes } = e.currentTarget.elements
    if (!condition.value) {
      flushSync(() => setError('Choose the item condition.'))
      condition.focus()
      return
    }
    setError('')
    onSubmit({
      condition: condition.value,
      accessoriesComplete: accessoriesComplete.checked,
      notes: notes.value,
    })
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} onChange={() => setError('')} noValidate>
      <label htmlFor="handoff-condition">
        <span id="handoff-condition-label">{conditionLabel}</span>
        <select name="condition" id="handoff-condition" className="ds-field" defaultValue=""
          aria-labelledby="handoff-condition-label" aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'handoff-condition-error' : undefined}>
          <option value="" disabled>Select condition</option>
          {ITEM_CONDITIONS.map((condition) => <option key={condition}>{condition}</option>)}
        </select>
        {error && <span id="handoff-condition-error" className="field-error" role="alert">{error}</span>}
      </label>

      <label className="booking-check">
        <input type="checkbox" name="accessoriesComplete" />
        {accessoriesLabel}
      </label>

      <label htmlFor="handoff-notes">
        <span id="handoff-notes-label">Notes (optional)</span>
        <textarea name="notes" id="handoff-notes" className="ds-field" aria-labelledby="handoff-notes-label"
          placeholder="Anything to note about the item" />
      </label>

      <button type="submit" className="ds-button ds-button--primary" disabled={pending}>
        {pending ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}

export default HandoffCheckForm
