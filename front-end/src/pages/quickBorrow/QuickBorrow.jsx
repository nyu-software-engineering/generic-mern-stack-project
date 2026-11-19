import { useState } from "react"
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import styles from './QuickBorrow.module.css'
import { createQuickBorrowRequest } from '../../services/quickBorrow'
import '../../styles/messages.css'

function QuickBorrow() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [invalidField, setInvalidField] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const { itemName, neededBy, neededTime, borrowDuration, approximateArea, details } = form.elements;

    let saved;
    try {
      saved = createQuickBorrowRequest({
      itemName: itemName.value,
      neededBy: neededBy.value,
      neededTime: neededTime.value,
      borrowDuration: borrowDuration.value,
      approximateArea: approximateArea.value,
      details: details.value,
      });
    } catch {
      setError('Could not save your request in this browser. Try again.');
      return;
    }

    if (!saved) {
      setSubmitted(false);
      const field = [itemName, neededBy, neededTime, borrowDuration, approximateArea, details].find((input) => !input.value.trim());
      flushSync(() => {
        setInvalidField(field?.name ?? '');
        setError('Please fill in every field. Spaces alone are not enough.');
      });
      field?.focus();
      return;
    }

    form.reset();
    setError('');
    setInvalidField('');
    setSubmitted(true);
  }

  return (
    <main className="ds-page ds-messages">
    <div>
      <Link to="/requests-board" className="ds-text-link">All requests</Link>
      <header className={styles.header}>
        <h1 className="ds-heading">Quick Borrow</h1>
      </header>
    </div>

    <p className="ds-message-meta">Save a short request in this browser and find it under My requests.</p>
    <form className={`${styles.form} ds-message-form ds-message-surface`} onSubmit={handleSubmit} onChange={(event) => {
      setSubmitted(false);
      if (invalidField && (event.target.name !== invalidField || !event.target.value.trim())) return;
      setError('');
      setInvalidField('');
    }}>
      <label className={styles.label} htmlFor="itemName">What do you need?</label>
      <input className="ds-field" type="text" id="itemName" name="itemName" aria-invalid={invalidField === 'itemName' || undefined} aria-describedby={invalidField === 'itemName' ? 'quick-borrow-error' : undefined} required />

      <label className={styles.label} htmlFor="neededBy">Needed by</label>
      <input className="ds-field" type="date" id="neededBy" name="neededBy" aria-invalid={invalidField === 'neededBy' || undefined} aria-describedby={invalidField === 'neededBy' ? 'quick-borrow-error' : undefined} required />

      <label className={styles.label} htmlFor="neededTime">Needed at</label>
      <input className="ds-field" type="time" id="neededTime" name="neededTime" aria-invalid={invalidField === 'neededTime' || undefined} aria-describedby={invalidField === 'neededTime' ? 'quick-borrow-error' : undefined} required />

      <label className={styles.label} htmlFor="borrowDuration">Borrow Duration</label>
      <input className="ds-field" type="text" id="borrowDuration" name="borrowDuration" aria-invalid={invalidField === 'borrowDuration' || undefined} aria-describedby={invalidField === 'borrowDuration' ? 'quick-borrow-error' : undefined} placeholder="e.g. 2 days" required />

      <label className={styles.label} htmlFor="approximateArea">Approximate Area</label>
      <input className="ds-field" type="text" id="approximateArea" name="approximateArea" aria-invalid={invalidField === 'approximateArea' || undefined} aria-describedby={invalidField === 'approximateArea' ? 'quick-borrow-error' : undefined} required />

      <label className={styles.label} htmlFor="details">Details</label>
      <textarea className="ds-field" id="details" name="details" aria-invalid={invalidField === 'details' || undefined} aria-describedby={invalidField === 'details' ? 'quick-borrow-error' : undefined} required></textarea>

      <button className="ds-button ds-button--primary" type="submit">Save request</button>

      {error && <p id="quick-borrow-error" className="ds-feedback ds-feedback--error" role="alert">{error}</p>}
      {submitted && <p className="ds-feedback" role="status">Your request was saved in this browser.</p>}
    </form>
    </main>
  )
}

export default QuickBorrow
