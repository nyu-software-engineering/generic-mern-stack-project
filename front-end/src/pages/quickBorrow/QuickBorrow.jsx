import { useState } from "react"
import styles from './QuickBorrow.module.css'

function QuickBorrow() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you can add the logic to send the item data to your backend or perform any other action
  }

  return (
    <>
    <div>
      <header className={styles.header}>
        <h3>Quick Borrow</h3>
      </header>
    </div>

    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="itemName">What do you need?</label>
      <input className={styles.input} type="text" id="itemName" name="itemName" required />

      <label className={styles.label} htmlFor="itemDescription">Needed when</label>
      <textarea className={styles.textarea} id="itemDescription" name="itemDescription" required></textarea>

      <label className={styles.label} htmlFor="borrowDuration">Borrow Duration</label>
      <input className={styles.input} type="text" id="borrowDuration" name="borrowDuration" required />

      <label className={styles.label} htmlFor="approximateArea">Approximate Area</label>
      <input className={styles.input} type="text" id="approximateArea" name="approximateArea" required />

      <label className={styles.label} htmlFor="details">Details</label>
      <input className={styles.input} type="text" id="details" name="details" required />

      <button className={styles.button} type="submit">Submit</button>
    </form>
    </>
  )
}

export default QuickBorrow
