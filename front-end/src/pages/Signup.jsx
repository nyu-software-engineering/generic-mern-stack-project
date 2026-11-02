import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import TextField from '../components/TextField'

function validateEmail(email) {
  if (!email.trim()) return 'Enter your email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
  return ''
}

function validatePassword(password) {
  if (!password) return 'Enter a password.'
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[0-9]/.test(password)) return 'Include at least one number.'
  return ''
}

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })

  const emailError = touched.email ? validateEmail(email) : ''
  const passwordError = touched.password ? validatePassword(password) : ''

  function handleSubmit(event) {
    event.preventDefault()
    setTouched({ email: true, password: true })
    if (validateEmail(email) || validatePassword(password)) return
    navigate('/choose-username')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-110 flex-col justify-center px-5 py-6">
      <h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900">
        Join Later
      </h1>
      <p className="mt-2.5 text-sm leading-normal text-gray-500">
        Save the places your friends keep sending you.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          error={emailError}
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, password: true }))}
          error={passwordError}
          hint="At least 8 characters, including a number."
          autoComplete="new-password"
        />
        <button
          type="submit"
          className="mt-2 min-h-11 cursor-pointer rounded-xl bg-gray-900 text-base font-semibold text-white hover:bg-gray-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-gray-900">
          Log in
        </Link>
      </p>
    </main>
  )
}