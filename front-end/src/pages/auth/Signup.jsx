
import { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

function Signup() {
  const { signIn } = useContext(AuthContext)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    const email = event.currentTarget.elements.email.value
      .trim()
      .toLowerCase()

    if (!email.endsWith('@nyu.edu')) {
      setMessage('Please use an NYU email address.')
      return
    }

    // Create a simulated user for the signup flow
    signIn(email)
    navigate('/verify-email')
  }

  return (
    <main className="auth-page">
      <Link to="/">Back</Link>

      <h2>Create account</h2>
      <h1>Join the NYU community</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          required
        />

        <label htmlFor="email">NYU email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="name@nyu.edu"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter a password"
          minLength={8}
          required
        />

        <button type="submit">Create account</button>
      </form>

      {message && <p>{message}</p>}

      <Link to="/login">Sign in instead</Link>
    </main>
  )
}

export default Signup
