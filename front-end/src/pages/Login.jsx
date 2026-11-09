
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import TextField from '../components/TextField'
import './Login.css'
import Button from '../components/Button'

function validateUsernameOrEmail(value) {
  if (!value.trim()) return 'Enter your username or email.'
  return ''
}

function validatePassword(value) {
  if (!value) return 'Enter your password.'
  return ''
}

export default function Login() {
  const navigate = useNavigate()
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({
    usernameOrEmail: false,
    password: false,
  })

  const usernameError = touched.usernameOrEmail
    ? validateUsernameOrEmail(usernameOrEmail)
    : ''

  const passwordError = touched.password
    ? validatePassword(password)
    : ''

  function handleSubmit(event) {
    event.preventDefault()

    setTouched({
      usernameOrEmail: true,
      password: true,
    })

    if (
      validateUsernameOrEmail(usernameOrEmail) ||
      validatePassword(password)
    ) {
      return
    }

    // TODO: replace with a real backend login call.
    navigate('/', { replace: true })
    
    
  }

  return (
    <main className="login-page">
      {/* Logo */}
      <h1 className="login-logo">Later?</h1>

      {/* Welcome message */}
      <section className="login-intro">
        <h2 className="login-title">Welcome back.</h2>
        <p className="login-subtitle">
          Your friends saved 6 new places since you left.
        </p>
      </section>

      {/* Login form */}
      <form onSubmit={handleSubmit} noValidate className="login-form">
        <TextField
          label="Username or email"
          value={usernameOrEmail}
          onChange={(event) => setUsernameOrEmail(event.target.value)}
          onBlur={() =>
            setTouched((current) => ({ ...current, usernameOrEmail: true }))
          }
          error={usernameError}
          autoComplete="username"
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() =>
            setTouched((current) => ({ ...current, password: true }))
          }
          error={passwordError}
          autoComplete="current-password"
        />

        {/* Forgot password */}
        <div className="login-forgot">
          <Link to="/forgot-password" className="login-forgot-link">
            Forgot password?
          </Link>
        </div>

        {/* Login button */}
        <Button type="submit" className="login-submit">
          Log in
        </Button>
      </form>

      {/* Signup link */}
      <p className="login-footer">
        New here?{' '}
        <Link to="/signup" className="login-link">
          Create an account
        </Link>
      </p>
    </main>
  )
  
}
