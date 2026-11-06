import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Avatar from '../components/Avatar'
import TextField from '../components/TextField'
import { currentUserId } from '../data/demoData'
import { getUserProfile, isUsernameTaken, updateUserProfile } from '../data/mockDataLayer'
import BackLink from '../components/BackLink'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

function validateName(name) {
  if (!name.trim()) return 'Enter your name.'
  if (name.trim().length > 50) return 'Keep your name under 50 characters.'
  return ''
}

function validateUsername(username) {
  if (!username) return 'Choose a username.'
  if (username.length < 3) return 'Use at least 3 characters.'
  if (username.length > 20) return 'Use 20 characters or fewer.'
  // Letters, numbers, underscores and dots only. No spaces.
  if (!/^[a-z0-9_.]+$/.test(username)) return 'Use only letters, numbers, dots and underscores.'
  if (isUsernameTaken(username, currentUserId)) return 'That username is taken.'
  return ''
}

export default function EditProfile() {
  const navigate = useNavigate()
  const profile = useMemo(() => getUserProfile(currentUserId), [])

  const [name, setName] = useState(profile?.name ?? '')
  const [username, setUsername] = useState(profile?.username ?? '')
  // The picture shown in the preview. Starts as the current photo.
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl ?? '')
  const [photoChanged, setPhotoChanged] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [touched, setTouched] = useState({ name: false, username: false })
  const [formError, setFormError] = useState('')

  if (!profile) {
    return (
      <section className="px-5 py-10 text-center">
        <h1 className="text-2xl font-semibold">We couldn’t load your profile</h1>
        <Link to="/login" className="mt-4 inline-block font-semibold text-brand hover:text-brand-dark">
          Log in again
        </Link>
      </section>
    )
  }

  const nameError = touched.name ? validateName(name) : ''
  const usernameError = touched.username ? validateUsername(username) : ''

  // People often type the @ out of habit, and capitals would make "Siyona" and "siyona" different
  function handleUsernameChange(event) {
    setUsername(event.target.value.replace(/^@/, '').toLowerCase())
  }

  function handlePhotoChange(event) {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file.')
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Choose a photo under 5 MB.')
      return
    }

    // We don't revoke this link on purpose: the Profile screen needs it after we leave this page
    setPhotoUrl(URL.createObjectURL(file))
    setPhotoChanged(true)
    setPhotoError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    setTouched({ name: true, username: true })
    if (validateName(name) || validateUsername(username)) return

    const result = updateUserProfile(profile.id, {
      name,
      username,
      photoUrl: photoChanged ? photoUrl : '',
    })
    if (!result.ok) {
      setFormError(result.error)
      return
    }
    navigate('/profile')
  }

  return (
    <section className="px-5 py-6">
      <BackLink to="/profile" label="Back to profile" className="mb-6" />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Edit profile</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* key makes the picture reset if the new photo fails to load */}
          <Avatar key={photoUrl} user={{ name: name || profile.name, photoUrl }} size="lg" />
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-900">Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-sm text-muted file:mr-3 file:rounded-button file:border-0 file:bg-peach file:px-3 file:py-2 file:font-semibold file:text-ink"
            />
          </label>
        </div>
        {photoError && <p role="alert" className="-mt-2 text-xs text-red-600">{photoError}</p>}

        <TextField
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          error={nameError}
        />
        <TextField
          label="Username"
          value={username}
          onChange={handleUsernameChange}
          onBlur={() => setTouched((current) => ({ ...current, username: true }))}
          error={usernameError}
          hint="Friends find you with this. 3 to 20 letters, numbers, dots or underscores."
        />

        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="mt-2 min-h-11 btn-primary hover:btn-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          Save changes
        </button>
      </form>
    </section>
  )
}
