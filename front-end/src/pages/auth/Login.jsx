
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

function Login() {
  const { signIn } = useContext(AuthContext)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    const email = event.currentTarget.elements.email.value
      .trim()
      .toLowerCase()

    if (!email.endsWith('@nyu.edu')) {
      setMessage('Please enter a valid NYU email address.')
      return
    }

    // Simulated sign-in for Sprint 1
    signIn(email)
    navigate('/browse')
  }

  return (
    <main>
      <h2>Sign in</h2>
      <h1>Welcome back</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="loginEmail">NYU email</label>
        <input
          id="loginEmail"
          name="email"
          type="email"
          placeholder="student@nyu.edu"
          required
        />

        <label htmlFor="loginPassword">Password</label>
        <input
          id="loginPassword"
          name="password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <button type="submit">Sign in</button>
      </form>

      {message && <p>{message}</p>}

      <Link to="/signup">Create account</Link>
    </main>
  )
}

export default Login
