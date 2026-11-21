import { useState } from 'react'
import { Link } from 'react-router'
import TextField from '../components/TextField'
import BackLink from '../components/BackLink'
import { changeMyPassword } from '../api/users'

// Same rules as the reset-password page and the server.
function validatePassword(password) {
  if (!password) return 'Enter a new password.'
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[0-9]/.test(password)) return 'Include at least one number.'
  return ''
}

function validateConfirm(password, confirm) {
  if (!confirm) return 'Confirm your new password.'
  if (confirm !== password) return 'Passwords do not match.'
  return ''
}

function validateCurrent(current) {
  if (!current) return 'Enter your current password.'
  return ''
}

/**
 * Change password for someone who is already signed in.
 * Opened from the Profile page
 */
export default function UpdatePassword() {
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  // Which fields the user has already left, so errors don't show on page load
  const [touched, setTouched] = useState({ current: false, password: false, confirm: false })

  // The server's message
  const [formError, setFormError] = useState('')
  // True while the request is on its way, so the button can't be pressed twice
  const [saving, setSaving] = useState(false)
  // Flips to true after the server says it worked
  const [done, setDone] = useState(false)

  const currentError = touched.current ? validateCurrent(current) : ''
  const passwordError = touched.password ? validatePassword(password) : ''
  const confirmError = touched.confirm ? validateConfirm(password, confirm) : ''

  async function handleSubmit(event) {
    // Keeps the browser from reloading the page
    event.preventDefault()
    setFormError('')

    // Count every field as touched so skipped ones show their errors too
    setTouched({ current: true, password: true, confirm: true })
    if (validateCurrent(current) || validatePassword(password) || validateConfirm(password, confirm)) return

    setSaving(true)
    try {
      await changeMyPassword({ currentPassword: current, newPassword: password })
      setDone(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <section className="px-5 py-6">
        <BackLink to="/profile" label="Back to profile" className="mb-6" />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Password updated</h1>
        <p className="mt-2 text-muted">Use your new password the next time you log in.</p>
        <Link
          to="/profile"
          className="mt-6 flex min-h-11 items-center justify-center btn-primary hover:btn-primary-hover"
        >
          Back to profile
        </Link>
      </section>
    )
  }

  return (
    <section className="px-5 py-6">
      <BackLink to="/profile" label="Back to profile" className="mb-6" />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Change password</h1>

      {/* noValidate turns off the browser's own popups */}
      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <TextField
          label="Current password"
          type="password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          onBlur={() => setTouched((old) => ({ ...old, current: true }))}
          error={currentError}
          autoComplete="current-password"
        />
        <TextField
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => setTouched((old) => ({ ...old, password: true }))}
          error={passwordError}
          hint="At least 8 characters, including a number."
          autoComplete="new-password"
        />
        <TextField
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          onBlur={() => setTouched((old) => ({ ...old, confirm: true }))}
          error={confirmError}
          autoComplete="new-password"
        />

        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 min-h-11 btn-primary hover:btn-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  )
}
