
import { useContext, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import '../../styles/accounts.css'

function VerifyEmail() {
  const { pendingSignup, verifyEmail } = useContext(AuthContext)
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const invalidCode = feedback === 'invalid'
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    if (!/^\d{6}$/.test(code)) {
      const codeInput = event.currentTarget.elements.code
      flushSync(() => {
        setFeedback('invalid')
        setErrorMessage('Please enter a 6-digit code.')
      })
      codeInput.focus()
      return
    }

    setSubmitting(true)
    setFeedback('')
    setErrorMessage('')

    try {
      await verifyEmail(code)
      navigate('/login', { replace: true })
    } catch (error) {
      setFeedback('invalid')
      setErrorMessage(error.message || 'Could not verify your email.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleResend() {
    setCode('')
    setErrorMessage('')
    setFeedback('resent')
  }

  if (!pendingSignup) {
    return <Navigate to="/signup" replace />
  }

  return (
    <main className="ds-page ds-account ds-account--form">
      <section className="ds-account-surface">
        <Link className="ds-text-link" to="/signup">Back</Link>
        <h1 className="ds-heading">Verify your demo email</h1>
        <p className="ds-account-help">The demo does not send a verification email.</p>
        <p className="ds-account-help">
          Your verification code: <strong>{pendingSignup.demoCode}</strong>
        </p>

        <form className="ds-account-form" onSubmit={handleSubmit}>
          <div className="ds-account-field">
            <label htmlFor="code">Verification code</label>
            <input
              className="ds-field"
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value)
                setFeedback('')
                setErrorMessage('')
              }}
              aria-invalid={invalidCode || undefined}
              aria-describedby={invalidCode ? 'verification-code-help verification-code-error' : 'verification-code-help'}
              maxLength={6}
              required
            />
            <p id="verification-code-help" className="ds-account-help">
              Enter the six-digit demo code shown above.
            </p>
            {invalidCode && (
              <p id="verification-code-error" className="ds-account-error" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="ds-account-actions">
            <button className="ds-button ds-button--primary" type="submit" disabled={submitting}>
              {submitting ? 'Verifying...' : 'Confirm demo code'}
            </button>
            <button className="ds-button ds-button--secondary" type="button" onClick={handleResend}>
              Resend code
            </button>
          </div>
        </form>

        <div role="status">
          {feedback === 'resent' && (
            <p className="ds-feedback">
              No email is sent. Use the demo verification code shown above.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default VerifyEmail
