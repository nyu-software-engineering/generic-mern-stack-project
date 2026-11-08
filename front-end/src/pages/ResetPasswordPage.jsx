import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../components'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  // checks both passwords and return errors
  function checkPasswords() {
    const found = {}

    if (!newPassword) {
      found.newPassword = 'Enter a new password.'
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      found.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    }

    if (!confirmPassword) {
      found.confirmPassword = 'Confirm your new password.'
    } else if (confirmPassword !== newPassword) {
      found.confirmPassword = "Passwords don't match."
    }

    return found
  }

  function handleSubmit(event) {
    event.preventDefault()

    const found = checkPasswords()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    navigate('/profile')
  }

  return (
    <div className="min-h-screen px-6 pt-12 pb-12">
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 text-stone-700"
      >
        <span aria-hidden="true">←</span> Back
      </button>

      <h1 className="mt-6 text-3xl font-bold">Reset password</h1>
      <p className="mt-3 text-stone-700">Enter and confirm your new password.</p>

      <div className="mt-4">
        <h2 className="text-sm font-semibold">Password requirements</h2>
        <ul className="mt-2 space-y-1 text-sm text-stone-700">
          <li>• At least 8 characters</li>
          <li>• Use a mix of letters and numbers</li>
          <li>• Avoid common patterns</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <Input
          label="New password"
          type={showNew ? 'text' : 'password'}
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          error={errors.newPassword}
          suffix={
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="ml-2 text-sm font-medium text-stone-700"
            >
              {showNew ? 'Hide' : 'Show'}
            </button>
          }
        />

        <Input
          label="Confirm password"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="ml-2 text-sm font-medium text-stone-700"
            >
              {showConfirm ? 'Hide' : 'Show'}
            </button>
          }
        />

        <Button type="submit" size="lg" fullWidth>
          Reset password
        </Button>
      </form>
    </div>
  )
}