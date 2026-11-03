import { useState } from 'react'
import { Link } from 'react-router'
import './Login.css'

export default function Login({ setUser }) {

  function handleSubmit(event) {
    event.preventDefault()
    setUser({ email: "test" })
  }

  return (

    <section className="login-card">
      <form className="login-form" onSubmit={handleSubmit}>

        <button type="submit">Log In</button>
      </form>

      <p>
        need an account? <Link to="/register">Create an account</Link>
      </p>
    </section>
  )
}