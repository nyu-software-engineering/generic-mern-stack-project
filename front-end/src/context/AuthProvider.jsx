
import { useState } from 'react'
import { api } from '../services/api.js'
import { AuthContext } from './AuthContext'

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(null)
  const [pendingSignup, setPendingSignup] = useState(null)

  async function signUp(fullName, email, password) {
    const result = await api('/auth/signup', {
      method: 'POST',
      body: { fullName, email, password },
    })

    setPendingSignup({ email: result.user.email, demoCode: result.demoCode })
    return result
  }

  async function verifyEmail(code) {
    if (!pendingSignup) throw new Error('Please create an account first.')

    const result = await api('/auth/verify', {
      method: 'POST',
      body: { email: pendingSignup.email, code },
    })

    setPendingSignup({ ...pendingSignup, demoCode: '' })
    return result.user
  }

  async function signIn(email, password) {
    const session = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    const { user } = await api('/users/me', { token: session.token })

    setToken(session.token)
    setCurrentUser(user)
    setPendingSignup(null)
    return user
  }

  async function updateProfile(displayName, campusArea) {
    if (!token) throw new Error('Please sign in again.')

    const { user } = await api('/users/me', {
      method: 'PUT',
      body: { displayName, campusArea },
      token,
    })

    setCurrentUser(user)
    return user
  }

  function signOut() {
    setCurrentUser(null)
    setToken(null)
    setPendingSignup(null)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        pendingSignup,
        signUp,
        verifyEmail,
        signIn,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
