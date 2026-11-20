import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
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

function isBackdropEvent(e) {
  if (e.target !== e.currentTarget) return false
  const { top, right, bottom, left } = e.currentTarget.getBoundingClientRect()
  return e.clientX < left || e.clientX >= right || e.clientY < top || e.clientY >= bottom
}

// Offer / counter-offer dialog (prototype m20). Prefills from the latest offer.
function OfferForm({ listing, initialOffer, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    totalPrice: initialOffer?.totalPrice ?? '',
    startDate: initialOffer?.startDate ?? '',
    endDate: initialOffer?.endDate ?? '',
  })
  const [errors, setErrors] = useState({})
  const dialogRef = useRef(null)
  const totalPriceRef = useRef(null)
  const cancelRef = useRef(null)
  const backdropPressed = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    const opener = document.activeElement
    dialog.showModal()
    totalPriceRef.current.focus()

    return () => {
      dialog.close()
      if (opener?.isConnected) opener.focus()
    }
  }, [])

  const days = form.startDate && form.endDate ? countDays(form.startDate, form.endDate) : 0

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validate(form)
    const firstInvalid = ['totalPrice', 'startDate', 'endDate'].find((field) => found[field])
    if (firstInvalid) {
      const input = e.currentTarget.elements.namedItem(firstInvalid)
      flushSync(() => setErrors(found))
      input.focus()
      return
    }
    onSubmit({ ...form, totalPrice: Number(form.totalPrice) })
  }

  const handleCancel = (e) => {
    e.preventDefault()
    onCancel()
  }

  const handleBackdropClick = (e) => {
    const clickedBackdrop = backdropPressed.current && isBackdropEvent(e)
    backdropPressed.current = false
    if (clickedBackdrop) onCancel()
  }

  const handleTab = (e) => {
    if (e.key !== 'Tab') return
    const first = totalPriceRef.current
    const last = cancelRef.current
    if (e.shiftKey && e.target === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && e.target === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="chat-offer-dialog"
      aria-labelledby="chat-offer-heading"
      onCancel={handleCancel}
      onPointerDown={(e) => { backdropPressed.current = isBackdropEvent(e) }}
      onClick={handleBackdropClick}
      onKeyDown={handleTab}
    >
      <form className="chat-offer-form" onSubmit={handleSubmit} noValidate>
        <h2 className="ds-heading" id="chat-offer-heading">Offer / counter-offer</h2>

        <div className="chat-offer-field">
          <label htmlFor="chat-offer-total-price">Total amount ($)</label>
          <input
            ref={totalPriceRef}
            id="chat-offer-total-price"
            className="ds-field"
            name="totalPrice"
            type="number"
            min="0"
            value={form.totalPrice}
            onChange={handleChange}
            aria-invalid={Boolean(errors.totalPrice)}
            aria-describedby={errors.totalPrice ? 'chat-offer-total-price-error' : undefined}
          />
          {errors.totalPrice && <span id="chat-offer-total-price-error" className="chat-error" role="alert">{errors.totalPrice}</span>}
        </div>
        {days > 0 && (
          <p className="chat-time">Listed price for {days} day{days === 1 ? '' : 's'}: ${days * listing.price}</p>
        )}

        <div className="chat-dates">
          <div className="chat-offer-field">
            <label htmlFor="chat-offer-start-date">Start date</label>
            <input
              id="chat-offer-start-date"
              className="ds-field"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              aria-invalid={Boolean(errors.startDate)}
              aria-describedby={errors.startDate ? 'chat-offer-start-date-error' : undefined}
            />
            {errors.startDate && <span id="chat-offer-start-date-error" className="chat-error" role="alert">{errors.startDate}</span>}
          </div>
          <div className="chat-offer-field">
            <label htmlFor="chat-offer-end-date">Return date</label>
            <input
              id="chat-offer-end-date"
              className="ds-field"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              aria-invalid={Boolean(errors.endDate)}
              aria-describedby={errors.endDate ? 'chat-offer-end-date-error' : undefined}
            />
            {errors.endDate && <span id="chat-offer-end-date-error" className="chat-error" role="alert">{errors.endDate}</span>}
          </div>
        </div>

        <div className="chat-actions">
          <button type="submit" className="ds-button ds-button--primary">Send offer</button>
          <button ref={cancelRef} type="button" className="ds-button ds-button--secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </dialog>
  )
}

export default OfferForm
