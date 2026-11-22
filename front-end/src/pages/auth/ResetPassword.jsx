import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { resetPassword, verifyPasswordResetCode } from '../../services/accountRecovery.js'
import '../../styles/accounts.css'

const badCode = 'This code is invalid or has expired. Check the code and try again. Request a new code after five incorrect attempts.'
const passwordRule = 'Use 8 to 128 characters.'

function ResetPassword() {
  const { state } = useLocation()
  const { pendingSignup, prepareResetSignOut } = useContext(AuthContext)
  const [email, setEmail] = useState(state?.email ?? '')
  const [grant, setGrant] = useState(null)
  const [outcome, setOutcome] = useState('')
  const [fieldError, setFieldError] = useState(null)
  const [requestError, setRequestError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const mounted = useRef(false)
  const pending = useRef(false)
  const passwordField = useRef(null)
  const outcomeHeading = useRef(null)

  useLayoutEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (!grant || submitting) return

    const timer = setTimeout(() => {
      if (!mounted.current || pending.current) return
      setGrant(null)
      setOutcome('expired')
    }, Math.max(0, grant.expiresAt - Date.now()))
    return () => clearTimeout(timer)
  }, [grant, submitting])

  useEffect(() => {
    if (outcome) outcomeHeading.current?.focus()
  }, [outcome])

  function showFieldError(input, message) {
    flushSync(() => setFieldError({ field: input.name, message }))
    input.focus()
  }

  function clearErrors() {
    setFieldError(null)
    setRequestError('')
  }

  async function handleVerify(event) {
    event.preventDefault()
    if (pending.current) return

    const fields = event.currentTarget.elements
    const codeInput = fields.code
    const normalizedEmail = email.trim().toLowerCase()
    const code = codeInput.value.trim()

    if (!/^[^\s@]+@nyu\.edu$/.test(normalizedEmail)) {
      showFieldError(fields.email, 'Please enter a valid NYU email address.')
      return
    }
    if (!/^\d{8}$/.test(code)) {
      showFieldError(codeInput, 'Please enter an 8-digit code.')
      return
    }

    pending.current = true
    setSubmitting(true)
    clearErrors()

    try {
      const { resetToken, expiresIn } = await verifyPasswordResetCode(normalizedEmail, code)
      if (!mounted.current) return
      codeInput.value = ''
      flushSync(() => {
        setEmail(normalizedEmail)
        setGrant({ token: resetToken, expiresAt: Date.now() + expiresIn * 1000 })
        setSubmitting(false)
      })
      passwordField.current?.focus()
    } catch (error) {
      if (!mounted.current) return
      if (error.status === 400) {
        showFieldError(codeInput, badCode)
      } else {
        setRequestError(error.status === 429
          ? 'Too many attempts. Try again later.'
          : 'Could not verify your code. Please try again.')
      }
    } finally {
      pending.current = false
      if (mounted.current) setSubmitting(false)
    }
  }

  async function handleReset(event) {
    event.preventDefault()
    if (pending.current) return

    if (Date.now() >= grant.expiresAt) {
      setGrant(null)
      setOutcome('expired')
      return
    }

    const fields = event.currentTarget.elements
    const passwordInput = fields.password
    const confirmInput = fields.confirmPassword
    const password = passwordInput.value

    if (password.length < 8 || password.length > 128) {
      showFieldError(passwordInput, 'Enter a password between 8 and 128 characters.')
      return
    }
    if (password !== confirmInput.value) {
      showFieldError(confirmInput, 'Passwords must match.')
      return
    }

    pending.current = true
    setSubmitting(true)
    clearErrors()

    const signOutAfterReset = prepareResetSignOut(email)
    try {
      await resetPassword(grant.token, password)
      signOutAfterReset()
      if (!mounted.current) return
      passwordInput.value = ''
      confirmInput.value = ''
      setGrant(null)
      setOutcome('success')
    } catch (error) {
      if (!mounted.current) return
      if (error.status === 400) {
        setGrant(null)
        setOutcome('expired')
      } else {
        setRequestError(error.status === 429
          ? 'Too many attempts. Try again later.'
          : 'Could not update your password. Please try again.')
      }
    } finally {
      pending.current = false
      if (mounted.current) setSubmitting(false)
    }
  }

  const freshCodeLink = (
    <Link className="ds-text-link" to="/forgot-password" state={{ email }}>
      Request a new code
    </Link>
  )

  if (outcome) {
    const canContinueVerification = pendingSignup?.demoCode && pendingSignup.email === email

    return (
      <main className="ds-page ds-account ds-account--form">
        <section className="ds-account-surface">
          <h1 className="ds-heading" ref={outcomeHeading} tabIndex={-1}>
            {outcome === 'success' ? 'Password reset complete' : 'Password reset expired'}
          </h1>
          {outcome === 'success' ? (
            <>
              <p className="ds-account-help">
                {canContinueVerification
                  ? 'Password updated. Finish verifying your email before signing in.'
                  : 'Password updated. Sign in with your new password.'}
              </p>
              <Link className="ds-button ds-button--primary" to={canContinueVerification ? '/verify-email' : '/login'}>
                {canContinueVerification ? 'Continue email verification' : 'Sign in'}
              </Link>
            </>
          ) : (
            <>
              <p className="ds-account-help">Request a new code to reset your password.</p>
              {freshCodeLink}
            </>
          )}
        </section>
      </main>
    )
  }

  const emailError = fieldError?.field === 'email'
  const codeError = fieldError?.field === 'code'
  const passwordError = fieldError?.field === 'password'
  const confirmError = fieldError?.field === 'confirmPassword'

  return (
    <main className="ds-page ds-account ds-account--form">
      <section className="ds-account-surface">
        <h1 className="ds-heading">Reset your password</h1>
        {grant ? (
          <>
            <p className="ds-account-help">
              You have five minutes to choose a new password. If you leave or reload this page, request a new code.
            </p>
            <form key="password" className="ds-account-form" onSubmit={handleReset} onChange={clearErrors} noValidate>
              <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
              <div className="ds-account-field">
                <label htmlFor="newPassword">New password</label>
                <input
                  className="ds-field"
                  id="newPassword"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  ref={passwordField}
                  aria-invalid={passwordError || undefined}
                  aria-describedby={passwordError ? 'new-password-error new-password-help' : 'new-password-help'}
                  minLength={8}
                  maxLength={128}
                  readOnly={submitting}
                  required
                />
                <p id="new-password-help" className="ds-account-help">{passwordRule}</p>
                {passwordError && (
                  <p id="new-password-error" className="ds-account-error" role="alert">
                    {fieldError.message}
                  </p>
                )}
              </div>

              <div className="ds-account-field">
                <label htmlFor="confirmNewPassword">Confirm new password</label>
                <input
                  className="ds-field"
                  id="confirmNewPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={confirmError || undefined}
                  aria-describedby={confirmError ? 'confirm-password-error' : undefined}
                  minLength={8}
                  maxLength={128}
                  readOnly={submitting}
                  required
                />
                {confirmError && (
                  <p id="confirm-password-error" className="ds-account-error" role="alert">
                    {fieldError.message}
                  </p>
                )}
              </div>

              {requestError && (
                <p className="ds-account-error" role="alert">{requestError}</p>
              )}

              <div className="ds-account-actions">
                <button className="ds-button ds-button--primary" type="submit" disabled={submitting}>
                  {submitting ? 'Updating password...' : 'Update password'}
                </button>
                {freshCodeLink}
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="ds-account-help">Enter the 8-digit reset code sent to your NYU email.</p>
            <form key="code" className="ds-account-form" onSubmit={handleVerify} onChange={clearErrors} noValidate>
              <div className="ds-account-field">
                <label htmlFor="resetEmail">NYU email</label>
                <input
                  className="ds-field"
                  id="resetEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="student@nyu.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={emailError || undefined}
                  aria-describedby={emailError ? 'reset-email-error' : undefined}
                  readOnly={submitting}
                  required
                />
                {emailError && (
                  <p id="reset-email-error" className="ds-account-error" role="alert">
                    {fieldError.message}
                  </p>
                )}
              </div>

              <div className="ds-account-field">
                <label htmlFor="resetCode">Reset code</label>
                <input
                  className="ds-field"
                  id="resetCode"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-invalid={codeError || undefined}
                  aria-describedby={codeError ? 'reset-code-error' : undefined}
                  maxLength={8}
                  readOnly={submitting}
                  required
                />
                {codeError && (
                  <p id="reset-code-error" className="ds-account-error" role="alert">
                    {fieldError.message}
                  </p>
                )}
              </div>

              {requestError && (
                <p className="ds-account-error" role="alert">{requestError}</p>
              )}

              <div className="ds-account-actions">
                <button className="ds-button ds-button--primary" type="submit" disabled={submitting}>
                  {submitting ? 'Verifying code...' : 'Verify code'}
                </button>
                {freshCodeLink}
              </div>
              <p className="ds-account-help">If you already verified your code, request a new one to continue.</p>
            </form>
          </>
        )}
      </section>
    </main>
  )
}

export default ResetPassword
