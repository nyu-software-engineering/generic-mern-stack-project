import { useState } from 'react'
import { signUp } from '../data/api.js'
import './Auth.css'

const EMPTY_FORM = { name: '', email: '', password: '', confirm: '' }
const SIGN_UP_ERROR = "Email in use or passwords don't match. Sign in or use matching passwords."

function SignUp() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError(SIGN_UP_ERROR)
      return
    }
    setSubmitting(true)
    try {
      await signUp({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      window.location.hash = '#/profile/edit'
    } catch (problem) {
      setError(problem.message)
      setSubmitting(false)
    }
  }

  return (
    <section className="auth">
      <p className="auth-logo">CareerHive</p>
      <a className="auth-back" href="#/welcome">&lt; Back</a>
      <h1>Create Account</h1>
      <p className="auth-lead">Use your school email to get started.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="signup-name">Full name</label>
        <input id="signup-name" className="ui-field" required autoComplete="name"
          value={form.name} onChange={(event) => update('name', event.target.value)} />

        <label htmlFor="signup-email">School email</label>
        <input id="signup-email" className="ui-field" type="email" required autoComplete="email"
          value={form.email} onChange={(event) => update('email', event.target.value)} />

        <label htmlFor="signup-password">Password</label>
        <input id="signup-password" className="ui-field" type="password" required autoComplete="new-password"
          value={form.password} onChange={(event) => update('password', event.target.value)} />

        <label htmlFor="signup-confirm">Confirm password</label>
        <input id="signup-confirm" className="ui-field" type="password" required autoComplete="new-password"
          value={form.confirm} onChange={(event) => update('confirm', event.target.value)} />

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="ui-button" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="auth-switch">Already have an account? <a href="#/login">Log in</a></p>
    </section>
  )
}

export default SignUp
