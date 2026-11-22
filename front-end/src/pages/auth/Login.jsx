
import { useContext, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import '../../styles/accounts.css'

function Login() {
  const { signIn, pendingSignup } = useContext(AuthContext)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    const fields = event.currentTarget.elements
    const emailInput = fields.email
    const email = emailInput.value.trim().toLowerCase()
    const password = fields.password.value

    if (!/^[^\s@]+@nyu\.edu$/.test(email)) {
      flushSync(() => setMessage('Please enter a valid NYU email address.'))
      emailInput.focus()
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const user = await signIn(email, password)
      navigate(user.campusArea ? '/browse' : '/setup-profile')
    } catch (error) {
      setMessage(error.message || 'Could not sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="ds-page ds-account ds-account--form">
      <section className="ds-account-surface">
        <h1 className="ds-heading">Sign in</h1>
        <p className="ds-account-help">
          Sign in with your registered NYU email and password.
        </p>

        <form className="ds-account-form" onSubmit={handleSubmit}>
          <div className="ds-account-field">
            <label htmlFor="loginEmail">NYU email</label>
            <input
              className="ds-field"
              id="loginEmail"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="student@nyu.edu"
              defaultValue={pendingSignup?.email ?? ''}
              onChange={() => setMessage('')}
              aria-invalid={Boolean(message) || undefined}
              aria-describedby={message ? 'login-email-error' : undefined}
              required
            />
            {message && (
              <p id="login-email-error" className="ds-account-error" role="alert">
                {message}
              </p>
            )}
          </div>

          <div className="ds-account-field">
            <label htmlFor="loginPassword">Password</label>
            <input
              className="ds-field"
              id="loginPassword"
              name="password"
              type="password"
              autoComplete="current-password"
              onChange={() => setMessage('')}
              required
            />
          </div>

          <div className="ds-account-actions">
            <button className="ds-button ds-button--primary" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
            <Link className="ds-text-link" to="/signup">Create account</Link>
          </div>
        </form>
      </section>
    </main>
  )
}

export default Login
