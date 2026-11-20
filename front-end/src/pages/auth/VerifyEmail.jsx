import { useContext, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import '../../styles/accounts.css'

function VerifyEmail() {
  const { currentUser, verifyEmail } = useContext(AuthContext)
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState('')
  const invalidCode = feedback === 'invalid'
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    if (!/^\d{6}$/.test(code)) {
      const codeInput = event.currentTarget.elements.code
      flushSync(() => setFeedback('invalid'))
      codeInput.focus()
      return
    }

    verifyEmail()
    navigate('/setup-profile')
  }

  function handleResend() {
    setCode('')
    setFeedback('resent')
  }

  if (!currentUser) {
    return <Navigate to="/signup" replace />
  }

  return (
    <main className="ds-page ds-account ds-account--form">
      <section className="ds-account-surface">
        <Link className="ds-text-link" to="/signup">Back</Link>
        <h1 className="ds-heading">Verify your demo email</h1>
        <p className="ds-feedback">The demo does not send a verification email.</p>

        <form className="ds-account-form" onSubmit={handleSubmit}>
          <div className="ds-account-field">
            <label htmlFor="code">Verification code</label>
            <input
              className="ds-field"
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value)
                setFeedback('')
              }}
              aria-invalid={invalidCode || undefined}
              aria-describedby={invalidCode ? 'verification-code-help verification-code-error' : 'verification-code-help'}
              maxLength={6}
              required
            />
            <p id="verification-code-help" className="ds-account-help">Enter any six digits to continue.</p>
            {invalidCode && (
              <p id="verification-code-error" className="ds-account-error" role="alert">Please enter a 6-digit code.</p>
            )}
          </div>

          <div className="ds-account-actions">
            <button className="ds-button ds-button--primary" type="submit">Confirm demo code</button>
            <button className="ds-button ds-button--secondary" type="button" onClick={handleResend}>
              Resend code
            </button>
          </div>
        </form>

        <div role="status">
          {feedback === 'resent' && (
            <p className="ds-feedback">Code cleared. The demo does not send a verification email.</p>
          )}
        </div>
      </section>
    </main>
  )
}

export default VerifyEmail
