
import { useContext, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

function VerifyEmail() {
  const { currentUser, verifyEmail } = useContext(AuthContext)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    if (!/^\d{6}$/.test(code)) {
      setMessage('Please enter a 6-digit code.')
      return
    }

    verifyEmail()
    navigate('/setup-profile')
  }

  function handleResend() {
    setCode('')
    setMessage('Demo mode: no verification email is sent.')
  }

  if (!currentUser) {
    return <Navigate to="/signup" replace />
  }

  return (
    <main className="auth-page">
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
          onChange={(event) => {
            setCode(event.target.value)
            setMessage('')
          }}
          maxLength={6}
          required
        />

        <button type="submit">Verify email</button>
      </form>

      <button type="button" onClick={handleResend}>
        Resend code
      </button>

      {message && <p role="alert">{message}</p>}
    </main>
  )
}

export default VerifyEmail
