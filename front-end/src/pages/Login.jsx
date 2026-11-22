import { useState } from 'react'
import { Link } from 'react-router'
import axios from "axios"
import './Login.css'

export default function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    
    try{
      const response = await axios.post("/api/auth/login", {email, password})
      //user is an email
      setUser(response.data.user)
    }
    catch(error){
      setError(error.response?.data?.error || "Could not login")
    }
  }

  return (
    <section className="login-card">
      <h1>Log in</h1>
      <p>Welcome to CampusMart</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            name="email" type="email"
            value={email} onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            name="password" type="password"
            value={password} onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}
        <button type="submit">Log In</button>
      </form>

      <p>
        need an account? <Link to="/register">Create an account</Link>
      </p>
    </section>
  )
}