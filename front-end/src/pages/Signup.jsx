import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import TextField from '../components/TextField'
import './Signup.css'
import Button from '../components/Button'

//TEMPORARY. TESTING BEFORE BACKEND DONE
//Will change to real test once the backend exists 

//const TAKEN_USERNAMES = ['admin', 'later', 'test']

// Checks a username and returns an error message, or '' if it's fine.
function validateUsername(username) {
  const value = username.trim().toLowerCase()
  if (!value) return 'Pick a username.'
  if (value.length < 3) return 'Use at least 3 characters.'
  if (!/^[a-z0-9_]+$/.test(value)) return 'Use only letters, numbers, and underscores.'
  //TO DO: Check username availability with back end
  return ''
}


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
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Tracks whether the user has finished with each field (clicked away or tried to submit)
  const [touched, setTouched] = useState({ username: false, email: false, password: false })

  // Only show an error once the field has been touched; otherwise the message is empty.
  const usernameError = touched.username ? validateUsername(username) : ''
  const emailError = touched.email ? validateEmail(email) : ''
  const passwordError = touched.password ? validatePassword(password) : ''


  // Runs when the form is submitted (button click or Enter key)
  function handleSubmit(event) {
    // Stops the browser's default behavior of reloading the page on submit
    event.preventDefault()
    // Mark both fields as touched so any errors show, even for fields the user skipped
    setTouched({ username: true, email: true, password: true })
    // If either field has an error, stop here and let the user fix it
    if (validateUsername(username) || validateEmail(email) || validatePassword(password)) return
    
    navigate('/', { replace: true })

  }

    return (
    <main className="signup-page">
      
      <h1 className="signup-logo">Later?</h1>

      <section className="signup-intro">
        <h2 className="signup-title">Stop losing places in the group chat.</h2>
        <p className="signup-subtitle">Pick a username so friends can find you.</p>
      </section>

      <form onSubmit={handleSubmit} noValidate className="signup-form">
        <TextField
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, username: true }))}
          error={usernameError}
          hint="Letters, numbers, and underscores."
          autoComplete="username"
        />
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
        <Button type="submit" className="signup-submit">
          Create account
        </Button>
      </form>

      <p className="signup-footer">
        Already have an account?{' '}
        <Link to="/login" className="signup-link">
          Log in
        </Link>
      </p>
    </main>
  )
}