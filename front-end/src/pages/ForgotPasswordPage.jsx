import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '../components'



const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


function validateEmail(email) {

  if (!email.trim()) return 'Enter your email.'
  
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address.'

  return ''
}

export default function ForgotPasswordPage() {

  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const [emailError, setEmailError] = useState('')

  const [isLinkSent, setIsLinkSent] = useState(false)

  const [isLinkResent, setIsLinkResent] = useState(false)

  function handleSubmit(event) {

    event.preventDefault()
    const error = validateEmail(email)
    setEmailError(error)
    if (error) return
    // since there is no back end yet, we oretend there is reset link
    setIsLinkSent(true)

  }

  function returnToEmailForm() {

    setIsLinkSent(false)
    setIsLinkResent(false)

  }

  function handleBack() {

    if (isLinkSent) {

      returnToEmailForm()

    } else {

      navigate('/login')
    }

  }

  return (

    <div className="min-h-screen px-6 pt-12 pb-12">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 text-stone-700"
      >
        <span aria-hidden="true">←</span> Forgot password
      </button>

      {isLinkSent ? (

        <div className="mt-6 flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Check your email</h1>
          <p className="text-stone-700">

            We sent a password reset link to{' '}

            <span className="font-semibold">{email.trim()}</span>. Follow the link to
            reset your password.
          </p>

          <p className="text-stone-700">
            Didn&apos;t get the email? Check your spam folder or request another link.
          </p>

          <Button size="lg" fullWidth onClick={() => setIsLinkResent(true)}>
            Resend link
          </Button>

          {isLinkResent && (
            <p className="text-sm text-stone-500">We sent another link.</p>
          )}

          <button
            type="button"
            onClick={returnToEmailForm}
            className="self-start text-stone-900"
          >
            Change email
          </button>
          <Link to="/login" className="self-start text-stone-900">
            Back to log in
          </Link>

        </div>

      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <p className="text-stone-700">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <Input
            label="Email"
            type="email"


            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError}

          />
          <Button type="submit" size="lg" fullWidth>
            Send reset link

          </Button>

          <Link to="/login" className="self-start text-stone-900">
            Back to log in

          </Link>

        </form>
      )}
    </div>
  )
}