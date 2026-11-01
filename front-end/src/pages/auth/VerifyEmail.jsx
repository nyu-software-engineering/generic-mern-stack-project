
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function VerifyEmail() {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    if (!/^\d{6}$/.test(code)) {
      setMessage('Please enter a 6-digit code.')
      return
    }

    // Simulated verification for Sprint 1
    navigate('/setup-profile')
  }

  function handleResend() {
    setCode('')
    setMessage('Demo mode: no verification email is sent.')
  }

  return (
    <main>
      <Link to="/signup">Back</Link>

      <h2>Verify NYU email</h2>
      <h1>Check your NYU inbox</h1>

      <p>Email verification is simulated for Sprint 1.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="code">Verification code</label>

        <input
          id="code"
          type="text"
          inputMode="numeric"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          maxLength={6}
          required
        />

        <button type="submit">Verify email</button>
      </form>

      <button type="button" onClick={handleResend}>
        Resend code
      </button>

      {message && <p>{message}</p>}
    </main>
  )
}

export default VerifyEmail
