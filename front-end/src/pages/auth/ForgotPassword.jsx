import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { requestPasswordReset } from '../../services/accountRecovery.js'
import '../../styles/accounts.css'

function ForgotPassword() {
  const { state } = useLocation()
  const [confirmation, setConfirmation] = useState(null)
  const [emailError, setEmailError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const mounted = useRef(false)
  const pending = useRef(false)
  const confirmationText = useRef(null)

  useLayoutEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (pending.current) return

    const emailInput = event.currentTarget.elements.email
    const email = emailInput.value.trim().toLowerCase()
    if (!/^[^\s@]+@nyu\.edu$/.test(email)) {
      flushSync(() => setEmailError('Please enter a valid NYU email address.'))
      emailInput.focus()
      return
    }

    pending.current = true
    setSubmitting(true)
    setRequestError('')

    try {
      const { message } = await requestPasswordReset(email)
      if (!mounted.current) return
      flushSync(() => setConfirmation({ email, message }))
      confirmationText.current?.focus()
    } catch (error) {
      if (!mounted.current) return
      setRequestError(error.status === 429
        ? 'Too many attempts. Try again later.'
        : 'Could not request a reset code. Please try again.')
    } finally {
      pending.current = false
      if (mounted.current) setSubmitting(false)
    }
  }

  return (
    <main className="ds-page ds-account ds-account--form">
      <section className="ds-account-surface">
        <h1 className="ds-heading">Forgot your password?</h1>

        {confirmation ? (
          <>
            <p className="ds-account-help" role="status" tabIndex={-1} ref={confirmationText}>
              {confirmation.message}
            </p>
            <div className="ds-account-actions">
              <Link
                className="ds-button ds-button--primary"
                to="/reset-password"
                state={{ email: confirmation.email }}
              >
                Enter reset code
              </Link>
              <Link className="ds-text-link" to="/login">Back to sign in</Link>
            </div>
          </>
        ) : (
          <>
            <p className="ds-account-help">
              Enter your registered NYU email to request a password reset code.
            </p>
            <form className="ds-account-form" onSubmit={handleSubmit} noValidate>
              <div className="ds-account-field">
                <label htmlFor="recoveryEmail">NYU email</label>
                <input
                  className="ds-field"
                  id="recoveryEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="student@nyu.edu"
                  defaultValue={state?.email ?? ''}
                  onChange={() => {
                    setEmailError('')
                    setRequestError('')
                  }}
                  aria-invalid={Boolean(emailError) || undefined}
                  aria-describedby={emailError ? 'recovery-email-error' : undefined}
                  readOnly={submitting}
                  required
                />
                {emailError && (
                  <p id="recovery-email-error" className="ds-account-error" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              {requestError && (
                <p className="ds-account-error" role="alert">{requestError}</p>
              )}

              <div className="ds-account-actions">
                <button className="ds-button ds-button--primary" type="submit" disabled={submitting}>
                  {submitting ? 'Sending request...' : 'Send reset code'}
                </button>
                <Link className="ds-text-link" to="/login">Back to sign in</Link>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  )
}

export default ForgotPassword
