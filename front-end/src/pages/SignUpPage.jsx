import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '../components'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

function validateSignUp({ email, password }) {

  const errors = {}
  if (!email.trim()) {

    errors.email = 'Enter your email.'

  } else if (!EMAIL_PATTERN.test(email.trim())) {

    errors.email = 'Enter a valid email address.'
  }
  if (!password) {

    errors.password = 'Enter a password.'

  } else if (password.length < MIN_PASSWORD_LENGTH) {

    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return errors
}

export default function SignUpPage() {

  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [errors, setErrors] = useState({})

  function handleSubmit(event) {

    event.preventDefault()

    const validationErrors = validateSignUp({ email, password })

    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    // tehre is no back-end yet ... any valid email and password creates an account for now
    navigate('/closet')

  }

  return (

    <div className="min-h-screen px-6 pt-12 pb-12">

      <button

        type="button"
        onClick={() => navigate('/welcome')}

        className="flex items-center gap-2 text-stone-700"

      >
        <span aria-hidden="true">←</span> Create account
      </button>

      <h1 className="mt-6 text-3xl font-bold">Create account</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">

        <Input

          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}

          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}

        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}

          autoComplete="new-password"
          value={password}

          onChange={(event) => setPassword(event.target.value)}
          hint={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
          error={errors.password}

          suffix={

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-sm font-medium text-stone-700"
            >
              {showPassword ? 'Hide' : 'Show'}

            </button>
          }
        />

        <Button type="submit" size="lg" fullWidth>
          Create account
        </Button>

      </form>

      <p className="mt-4 text-sm text-stone-500">

        By creating an account, you agree to our{' '}
        <span className="font-semibold text-stone-900">Terms</span> and{' '}
        <span className="font-semibold text-stone-900">Privacy Policy</span>.
      </p>

      <p className="mt-4 text-stone-700">
        
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-stone-900 underline">

          Log in
        </Link>

      </p>
    </div>


  )
}