
import { useState } from 'react'
import { AuthContext } from './AuthContext'

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)

  function signIn(email) {
    setCurrentUser({
      email,
      displayName: '',
      campusArea: ''
    })
  }

  function updateProfile(displayName, campusArea) {
    setCurrentUser((user) =>
      user ? { ...user, displayName, campusArea } : user
    )
  }

  function signOut() {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, signIn, updateProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
