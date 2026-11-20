import { useContext, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import '../../styles/accounts.css'

function Login() {
  const { signIn } = useContext(AuthContext)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    const emailInput = event.currentTarget.elements.email
    const email = emailInput.value.trim().toLowerCase()

    if (!email.endsWith('@nyu.edu')) {
      flushSync(() => setMessage('Please enter a valid NYU email address.'))
      emailInput.focus()
      return
    }

    signIn(email)
    navigate('/browse')
  }

  return (
    <main className="ds-page ds-account ds-account--form">
      <section className="ds-account-surface">
        <h1 className="ds-heading">Sign in</h1>
        <p className="ds-account-help">
          This demo accepts any password. Account changes reset when you reload.
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
              onChange={() => setMessage('')}
              aria-invalid={Boolean(message) || undefined}
              aria-describedby={message ? 'login-email-error' : undefined}
              required
            />
            {message && <p id="login-email-error" className="ds-account-error" role="alert">{message}</p>}
          </div>

          <div className="ds-account-field">
            <label htmlFor="loginPassword">Password</label>
            <input
              className="ds-field"
              id="loginPassword"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="ds-account-actions">
            <button className="ds-button ds-button--primary" type="submit">Sign in</button>
            <Link className="ds-text-link" to="/signup">Create account</Link>
          </div>
        </form>
      </section>
    </main>
  )
}

export default Login
