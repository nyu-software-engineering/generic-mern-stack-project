
import { useState } from 'react'
import { AuthContext } from './AuthContext'

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [profiles, setProfiles] = useState({})

  function signIn(email, displayName = '') {
    const savedProfile = profiles[email]

    const user = savedProfile || {
      email,
      displayName,
      campusArea: ''
    }

    setCurrentUser(user)

    setProfiles((previous) => ({
      ...previous,
      [email]: user
    }))
  }

  function updateProfile(displayName, campusArea) {
    if (!currentUser) return

    const updatedUser = {
      ...currentUser,
      displayName,
      campusArea
    }

    setCurrentUser(updatedUser)

    setProfiles((previous) => ({
      ...previous,
      [currentUser.email]: updatedUser
    }))
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
