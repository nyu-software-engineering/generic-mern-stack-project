import { useContext, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import '../../styles/accounts.css'

function SetupProfile() {
  const { currentUser, updateProfile } = useContext(AuthContext)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    const fields = event.currentTarget.elements
    const displayName = fields.displayName.value.trim()
    const campusArea = fields.campusArea.value.trim()

    if (!displayName || !campusArea) {
      flushSync(() => setErrors({ displayName: !displayName, campusArea: !campusArea }))
      const firstInvalid = displayName ? fields.campusArea : fields.displayName
      firstInvalid.focus()
      return
    }

    updateProfile(displayName, campusArea)
    navigate('/browse')
  }

  if (!currentUser) {
    return <Navigate to="/signup" replace />
  }

  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return (
    <main className="ds-page ds-account ds-account--form">
      <section className="ds-account-surface">
        <Link className="ds-text-link" to="/verify-email">Back</Link>
        <h1 className="ds-heading">Set up your profile</h1>

        <form className="ds-account-form" onSubmit={handleSubmit} onChange={() => setErrors({})}>
          <div className="ds-account-field">
            <label htmlFor="displayName">Display name</label>
            <input
              className="ds-field"
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="nickname"
              defaultValue={currentUser.displayName || ''}
              aria-invalid={errors.displayName || undefined}
              aria-describedby={errors.displayName ? 'profile-name-error' : undefined}
              required
            />
            {errors.displayName && (
              <p id="profile-name-error" className="ds-account-error" role="alert">Please enter a display name.</p>
            )}
          </div>

          <div className="ds-account-field">
            <label htmlFor="campusArea">Campus area</label>
            <input
              className="ds-field"
              id="campusArea"
              name="campusArea"
              type="text"
              autoComplete="off"
              defaultValue={currentUser.campusArea || ''}
              aria-invalid={errors.campusArea || undefined}
              aria-describedby={errors.campusArea ? 'profile-area-help profile-area-error' : 'profile-area-help'}
              required
            />
            <p id="profile-area-help" className="ds-account-help">Use a general area, such as Washington Square.</p>
            {errors.campusArea && (
              <p id="profile-area-error" className="ds-account-error" role="alert">Please enter a campus area.</p>
            )}
          </div>

          <div className="ds-account-actions">
            <button className="ds-button ds-button--primary" type="submit">Save profile</button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default SetupProfile
