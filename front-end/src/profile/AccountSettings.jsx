import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Profile.css'

function AccountSettings() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  // quick checks here, then the back-end checks the current password
  function handleSubmit(e) {
    e.preventDefault()
    if (next.length < 8) return setError('New password must be at least 8 characters.')
    if (next !== confirm) return setError('New passwords do not match.')
    if (next === current) return setError('New password must be different from your current one.')

    fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) return setError(data.error)
        setError('')
        setSaved(true)
      })
      .catch(() => setError('Could not reach the server. Try again.'))
  }

  if (saved) {
    return (
      <div className="profile-page">
        <h1>Password Updated</h1>
        <p>Your password has been changed.</p>
        <button type="button" className="profile-btn-solid" onClick={() => navigate('/profile')}>
          Back to Profile
        </button>
      </div>
    )
  }

  return (
    <form className="profile-page" onSubmit={handleSubmit}>
      <h1>Account Settings</h1>
      <h2>Change Password</h2>

      <label>
        Current password
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
      </label>

      <label>
        New password
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required />
      </label>

      <label>
        Confirm new password
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      </label>

      {error && <p className="profile-error">{error}</p>}

      <button type="submit" className="profile-btn-solid">Update Password</button>
      <button type="button" className="profile-btn-link" onClick={() => navigate('/profile')}>Cancel</button>
    </form>
  )
}

export default AccountSettings
