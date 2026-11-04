import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '../components'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateLogIn({ email, password }) {

  const errors = {}

  if (!email.trim()) {

    errors.email = 'Enter your email.'

  } else if (!EMAIL_PATTERN.test(email.trim())) {

    errors.email = 'Enter a valid email address.'
  }


  if (!password) {
    errors.password = 'Enter your password.'
  }

  return errors

}


export default function LogInPage() {

  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})



  function handleSubmit(event) {

    event.preventDefault()
    const validationErrors = validateLogIn({ email, password })
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    // theres no back end for now btw
    navigate('/closet')
  }

  return (

    <div className="min-h-screen px-6 pt-12 pb-12">
      <button
        type="button"
        onClick={() => navigate('/welcome')}

        className="flex items-center gap-2 text-stone-700"
      >

        <span aria-hidden="true">←</span> Log in
      </button>

      <h1 className="mt-6 text-3xl font-bold">Welcome back</h1>

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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
        <Link to="/forgot-password" className="text-sm font-medium text-stone-900">
          Forgot password?
        </Link>
        <Button type="submit" size="lg" fullWidth>
          Log in
        </Button>

      </form>

      <p className="mt-6 text-center text-stone-700">
        New here?{' '}

        <Link to="/signup" className="font-medium text-stone-900 underline">
          Create an account

        </Link>

      </p>
      
    </div>
  )
}
