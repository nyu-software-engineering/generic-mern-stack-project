import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import TextField from '../components/TextField'

// Checks an email and returns an error message, or '' if the email is fine.
function validateEmail(email) {
  // trim() removes spaces, so "   " counts as empty
  if (!email.trim()) return 'Enter your email.'
  // The pattern is some text, then @, then some text, then a dot, then some text.
  // No spaces are allowed anywhere. This catches invalid emails like "abc" and "abc@"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
  return ''
}

// Checks a password the same way: returns the first problem found, or '' if it's fine
function validatePassword(password) {
  if (!password) return 'Enter a password.'
  if (password.length < 8) return 'Use at least 8 characters.'
  // /[0-9]/ looks for at least one digit anywhere in the password
  if (!/[0-9]/.test(password)) return 'Include at least one number.'
  return ''
}

export default function Signup() {
  const navigate = useNavigate()

  // What the user has typed so far. Each useState gives a value and a function to change it.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Tracks whether the user has finished with each field (clicked away or tried to submit)
  const [touched, setTouched] = useState({ email: false, password: false })

  // Only show an error once the field has been touched; otherwise the message is empty.
  const emailError = touched.email ? validateEmail(email) : ''
  const passwordError = touched.password ? validatePassword(password) : ''


  // Runs when the form is submitted (button click or Enter key)
  function handleSubmit(event) {
    // Stops the browser's default behavior of reloading the page on submit
    event.preventDefault()
    // Mark both fields as touched so any errors show, even for fields the user skipped
    setTouched({ email: true, password: true })
    // If either field has an error, stop here and let the user fix it
    if (validateEmail(email) || validatePassword(password)) return
    //will go to the choose-username screen once it is done
    navigate('/choose-username')
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-110 flex-col justify-center bg-background px-5 py-6 text-ink">
      <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink">
        Join Later
      </h1>
      <p className="mt-2.5 text-sm leading-normal text-muted">
        Stop losing places in the groupchat
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
          className="mt-2 min-h-11 cursor-pointer rounded-xl bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand hover:text-brand-dark">
          Log in
        </Link>
      </p>
    </main>
  )
}