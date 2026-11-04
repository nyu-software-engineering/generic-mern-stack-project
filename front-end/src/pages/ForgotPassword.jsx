import { useState } from 'react'
import { Link } from 'react-router'
import TextField from '../components/TextField'
import './ForgotPassword.css'

function validateEmail(email) {
  if (!email.trim()) return 'Enter your email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
  return ''
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')

  // Has the user left the email box yet? Keeps the error hidden until they have.
  const [touched, setTouched] = useState(false)

  // Flips to true after a successful submit, which swaps the form for the
  // "check your inbox" message.
  const [sent, setSent] = useState(false)

  // Error stays blank until the field has been touched
  const emailError = touched ? validateEmail(email) : ''

  function handleSubmit(event) {
    // Keeps the browser from reloading the page
    event.preventDefault()

    // Count the field as touched so an empty box shows its error
    setTouched(true)

    // Something's wrong, so stay here and let them fix it
    if (validateEmail(email)) return

    // TODO: replace with a real backend call that emails a reset link.
    // Only show the success message once the request goes through.
    setSent(true)
  }

  // Lets someone who typo'd their email go back and try again
  function handleUseDifferentEmail() {
    setSent(false)
    setTouched(false)
    setEmail('')
  }

  return (
    <main className="forgot-page">
      {/* Logo */}
      <h1 className="forgot-logo">Later?</h1>

      {sent ? (
        // Success state: shown after the form is submitted
        <>
          <section className="forgot-intro">
            <h2 className="forgot-title">Check your inbox.</h2>
            {/* Worded as "if" on purpose, so we never reveal whether an account exists */}
            <p className="forgot-subtitle">
              If an account exists for {email.trim()}, we just sent a link to
              reset your password.
            </p>
          </section>

          <div className="forgot-actions">
            {/* Styled like a button, but it's a link because it goes to another page */}
            <Link to="/login" className="forgot-back btn-secondary">
              Back to log in
            </Link>
            <button
              type="button"
              onClick={handleUseDifferentEmail}
              className="forgot-retry"
            >
              Use a different email
            </button>
          </div>
        </>
      ) : (
        // Default state: the form
        <>
          <section className="forgot-intro">
            <h2 className="forgot-title">Forgot your password?</h2>
            <p className="forgot-subtitle">
              Enter your email and we'll send you a link to reset it.
            </p>
          </section>

          {/* noValidate turns off the browser's own popups */}
          <form onSubmit={handleSubmit} noValidate className="forgot-form">
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              // Clicking away counts as "done with this field"
              onBlur={() => setTouched(true)}
              error={emailError}
              autoComplete="email"
            />

            {/* Colors come from btn-primary in index.css, layout from ForgotPassword.css */}
            <button type="submit" className="forgot-submit btn-primary hover:btn-primary-hover">
              Send reset link
            </button>
          </form>

          {/* For people who remembered it after all */}
          <p className="forgot-footer">
            Remembered it?{' '}
            <Link to="/login" className="forgot-link">
              Log in
            </Link>
          </p>
        </>
      )}
    </main>
  )

}