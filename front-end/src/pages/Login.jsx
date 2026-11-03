import { useState } from 'react'
import { Link } from 'react-router'
import './Login.css'

export default function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setUser({ email: email.trim().toLowerCase() })
  }

  return (
    <section className="login-card">
      <h1>Log in</h1>
      <p>Welcome to CampusMart</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            name="email" type="email"
            value={email} onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            name="password" type="password"
            value={password} onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button type="submit">Log In</button>
      </form>

      <p>
        need an account? <Link to="/register">Create an account</Link>
      </p>
    </section>
  )
}