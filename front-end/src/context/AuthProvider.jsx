import { useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  createAuthSession,
  readPendingSignup,
} from './authSession.js'

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [pendingSignup, setPendingSignup] = useState(readPendingSignup)

  const [authSession] = useState(() =>
    createAuthSession({
      onCurrentUser: setCurrentUser,
      onPendingSignup: setPendingSignup,
    })
  )

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        pendingSignup,
        ...authSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider