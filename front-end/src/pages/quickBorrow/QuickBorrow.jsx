import { useState } from "react"
import { Link } from 'react-router-dom'
import styles from './QuickBorrow.module.css'
import { createQuickBorrowRequest } from '../../services/quickBorrow'

function QuickBorrow() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const { itemName, neededBy, neededTime, borrowDuration, approximateArea, details } = form.elements;

    const saved = createQuickBorrowRequest({
      itemName: itemName.value,
      neededBy: neededBy.value,
      neededTime: neededTime.value,
      borrowDuration: borrowDuration.value,
      approximateArea: approximateArea.value,
      details: details.value,
    });

    if (!saved) {
      setSubmitted(false);
      setError('Please fill in every field. Spaces alone are not enough.');
      return;
    }

    form.reset();
    setError('');
    setSubmitted(true);
  }

  return (
    <>
    <div>
      <Link to="/requests-board" className={styles.back}>← All requests</Link>
      <header className={styles.header}>
        <h3>Quick Borrow</h3>
      </header>
    </div>

    <form className={styles.form} onSubmit={handleSubmit} onChange={() => { setSubmitted(false); setError('') }}>
      <label className={styles.label} htmlFor="itemName">What do you need?</label>
      <input className={styles.input} type="text" id="itemName" name="itemName" required />

      <label className={styles.label} htmlFor="neededBy">Needed by</label>
      <input className={styles.input} type="date" id="neededBy" name="neededBy" required />

      <label className={styles.label} htmlFor="neededTime">Needed at</label>
      <input className={styles.input} type="time" id="neededTime" name="neededTime" required />

      <label className={styles.label} htmlFor="borrowDuration">Borrow Duration</label>
      <input className={styles.input} type="text" id="borrowDuration" name="borrowDuration" placeholder="e.g. 2 days" required />

      <label className={styles.label} htmlFor="approximateArea">Approximate Area</label>
      <input className={styles.input} type="text" id="approximateArea" name="approximateArea" required />

      <label className={styles.label} htmlFor="details">Details</label>
      <textarea className={styles.textarea} id="details" name="details" required></textarea>

      <button className={styles.button} type="submit">Submit</button>

      {error && <p role="alert">{error}</p>}
      {submitted && <p role="status">Your request was saved.</p>}
    </form>
    </>
  )
}

export default QuickBorrow
