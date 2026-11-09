import { useState } from 'react'
import { logIn } from '../data/api.js'
import './Auth.css'

function LogIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await logIn(email.trim(), password)
      window.location.hash = '#/home'
    } catch (problem) {
      setError(problem.message)
      setPassword('')
      setSubmitting(false)
    }
  }

  return (
    <section className="auth">
      <p className="auth-logo">CareerHive</p>
      <a className="auth-back" href="#/welcome">&lt; Back</a>
      <h1>Log In</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" className="ui-field" type="email" required autoComplete="email"
          value={email} onChange={(event) => setEmail(event.target.value)} />

        <label htmlFor="login-password">Password</label>
        <input id="login-password" className="ui-field" type="password" required autoComplete="current-password"
          value={password} onChange={(event) => setPassword(event.target.value)} />

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="ui-button" type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <p className="auth-switch">Don&apos;t have an account? <a href="#/signup">Sign up</a></p>
    </section>
  )
}

export default LogIn
