import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from "axios"
import './Register.css'

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      await axios.post('/api/auth/register', { email, password })
      navigate('/login')
    } catch (error) {
      setError(error.response?.data?.error || "Could not create your account.")
    }
  }

  return (
    <section className="register-card">
      <h1>Create an account</h1>
      <p>Join CampusMart</p>

      <form className="register-form" onSubmit={handleSubmit}>
        <label>
          University email
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

        {/* display an error if could not create account */}
        {error && <p role="alert">{error}</p>}

        <button type="submit">Create Account</button>
      </form>

      <p>
        already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  )
}