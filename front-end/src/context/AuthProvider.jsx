
import { useState } from 'react'
import { AuthContext } from './AuthContext'

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [profiles, setProfiles] = useState({})

  function signIn(email) {
    const savedProfile = profiles[email]

    setCurrentUser(
      savedProfile || {
        email,
        displayName: '',
        campusArea: ''
      }
    )
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
