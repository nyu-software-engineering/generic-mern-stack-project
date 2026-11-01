
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

    updateProfile(displayName, campusArea)
    navigate('/browse')
  }

  return (
    <main>
      <Link to="/verify-email">Back</Link>

      <h2>Basic profile setup</h2>

      <img
        src="https://picsum.photos/seed/dormshare-profile/360/120"
        alt="Sample profile"
        width="360"
      />

      <form onSubmit={handleSubmit}>
        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          name="displayName"
          type="text"
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

      {message && <p>{message}</p>}
    </main>
  )
}

export default SetupProfile
