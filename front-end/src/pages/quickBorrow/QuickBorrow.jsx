import { useState } from "react"
import styles from './QuickBorrow.module.css'
import { createQuickBorrowRequest } from '../../services/quickBorrow'

function QuickBorrow() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const { itemName, neededBy, borrowDuration, approximateArea, details } = form.elements;

    createQuickBorrowRequest({
      itemName: itemName.value,
      neededBy: neededBy.value,
      borrowDuration: borrowDuration.value,
      approximateArea: approximateArea.value,
      details: details.value,
    });

    form.reset();
    setSubmitted(true);
  }

  return (
    <>
    <div>
      <header className={styles.header}>
        <h3>Quick Borrow</h3>
      </header>
    </div>

    <form className={styles.form} onSubmit={handleSubmit} onChange={() => setSubmitted(false)}>
      <label className={styles.label} htmlFor="itemName">What do you need?</label>
      <input className={styles.input} type="text" id="itemName" name="itemName" required />

      <label className={styles.label} htmlFor="neededBy">Needed by</label>
      <input className={styles.input} type="date" id="neededBy" name="neededBy" required />

      <label className={styles.label} htmlFor="borrowDuration">Borrow Duration</label>
      <input className={styles.input} type="text" id="borrowDuration" name="borrowDuration" placeholder="e.g. 2 days" required />

      <label className={styles.label} htmlFor="approximateArea">Approximate Area</label>
      <input className={styles.input} type="text" id="approximateArea" name="approximateArea" required />

      <label className={styles.label} htmlFor="details">Details</label>
      <textarea className={styles.textarea} id="details" name="details" required></textarea>

      <button className={styles.button} type="submit">Submit</button>

      {submitted && <p role="status">Your request was saved.</p>}
    </form>
    </>
  )
}

export default QuickBorrow
