
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

function SetupProfile() {
  const { currentUser, updateProfile } = useContext(AuthContext)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    if (!currentUser) {
      setMessage('Please sign up or sign in first.')
      return
    }

    const displayName = event.currentTarget.elements.displayName.value.trim()
    const campusArea = event.currentTarget.elements.campusArea.value.trim()

    if (!displayName || !campusArea) {
      setMessage('Please enter a display name and campus area.')
      return
    }

    updateProfile(displayName, campusArea)
    navigate('/browse')
  }

  return (
    <main className="auth-page">
      <Link to="/verify-email">Back</Link>

      <h2>Basic profile setup</h2>


      <form onSubmit={handleSubmit} onChange={() => setMessage('')}>
        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          defaultValue={currentUser?.displayName || ''}
          placeholder="Enter your display name"
          required
        />

        <label htmlFor="campusArea">Campus area</label>
        <input
          id="campusArea"
          name="campusArea"
          type="text"
          placeholder="e.g. Near campus"
          required
        />

        <p>Your private address and phone number are not public.</p>

        <button type="submit">Save profile</button>
      </form>

      {message && <p role="alert">{message}</p>}
    </main>
  )
}

export default SetupProfile
