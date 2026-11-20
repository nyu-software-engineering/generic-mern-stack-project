import { useContext, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import '../../styles/accounts.css'

function Signup() {
  const { signIn } = useContext(AuthContext)
  const [invalidField, setInvalidField] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    const fields = event.currentTarget.elements
    const fullName = fields.fullName.value.trim()
    const email = fields.email.value.trim().toLowerCase()

    if (!fullName) {
      flushSync(() => setInvalidField('fullName'))
      fields.fullName.focus()
      return
    }

    if (!email.endsWith('@nyu.edu')) {
      flushSync(() => setInvalidField('email'))
      fields.email.focus()
      return
    }

    signIn(email, fullName)
    navigate('/verify-email')
  }

  return (
    <main className="ds-page ds-account ds-account--form">
      <section className="ds-account-surface">
        <Link className="ds-text-link" to="/">Back</Link>
        <h1 className="ds-heading">Create an account</h1>
        <p className="ds-account-help">
          You are creating a demo account. Account changes reset when you reload.
        </p>

        <form className="ds-account-form" onSubmit={handleSubmit} onChange={() => setInvalidField('')}>
          <div className="ds-account-field">
            <label htmlFor="fullName">Full name</label>
            <input
              className="ds-field"
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              aria-invalid={invalidField === 'fullName' || undefined}
              aria-describedby={invalidField === 'fullName' ? 'signup-name-error' : undefined}
              required
            />
            {invalidField === 'fullName' && (
              <p id="signup-name-error" className="ds-account-error" role="alert">Please enter your full name.</p>
            )}
          </div>

          <div className="ds-account-field">
            <label htmlFor="email">NYU email</label>
            <input
              className="ds-field"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@nyu.edu"
              aria-invalid={invalidField === 'email' || undefined}
              aria-describedby={invalidField === 'email' ? 'signup-email-error' : undefined}
              required
            />
            {invalidField === 'email' && (
              <p id="signup-email-error" className="ds-account-error" role="alert">Please use an NYU email address.</p>
            )}
          </div>

          <div className="ds-account-field">
            <label htmlFor="password">Password</label>
            <input
              className="ds-field"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-describedby="signup-password-help"
              minLength={8}
              required
            />
            <p id="signup-password-help" className="ds-account-help">Use at least eight characters.</p>
          </div>

          <div className="ds-account-actions">
            <button className="ds-button ds-button--primary" type="submit">Create account</button>
            <Link className="ds-text-link" to="/login">Sign in instead</Link>
          </div>
        </form>
      </section>
    </main>
  )
}

export default Signup
