import { useState } from 'react'
import { useNavigate } from 'react-router'

import TextField from '../components/TextField'
import './ChangePassword.css'

function validatePassword(password) {
  if (!password) return 'Enter a new password.'
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[0-9]/.test(password)) return 'Include at least one number.'
  return ''
}

// Both boxes have to match, so a typo doesn't lock them out.
function validateConfirm(password, confirm) {
  if (!confirm) return 'Confirm your new password.'
  if (confirm !== password) return 'Passwords do not match.'
  return ''
}

export default function ChangePassword() {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')

    // Which fields the user has already left, so errors don't show on page load
    const [touched, setTouched] = useState({ password: false, confirm: false })

    // Errors stay blank until the field has been touched
    const passwordError = touched.password ? validatePassword(password) : ''
    const confirmError = touched.confirm ? validateConfirm(password, confirm) : ''

    function handleSubmit(event) {
        // Keeps the browser from reloading the page
        event.preventDefault()

        // Count both fields as touched so skipped ones show their errors too
        setTouched({ password: true, confirm: true })

        if (validatePassword(password) || validateConfirm(password, confirm)) return

        //TO DO: Send password to backend later

        navigate('/login', { replace: true })
    }

    return (
        <main className="change-page">
        {/* Logo */}
        <h1 className="change-logo">Later?</h1>

        <section className="change-intro">
            <h2 className="change-title">Set a new password.</h2>
            <p className="change-subtitle">
            Pick something you haven't used here before.
            </p>
        </section>
        <form onSubmit={handleSubmit} noValidate className="change-form">
            <TextField
            label="New password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, password: true }))}
            error={passwordError}
            hint="At least 8 characters, including a number."
            autoComplete="new-password"
            />

            <TextField
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, confirm: true }))}
            error={confirmError}
            autoComplete="new-password"
            />

            <button type="submit" className="change-submit btn-primary hover:btn-primary-hover">
            Update password
            </button>
        </form>
     </main>
    )
}

        