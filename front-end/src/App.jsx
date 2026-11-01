
import { useContext } from 'react'
import {
  BrowserRouter,
  Link,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import { AuthContext } from './context/AuthContext'
import Welcome from './pages/auth/Welcome'
import Signup from './pages/auth/Signup'
import VerifyEmail from './pages/auth/VerifyEmail'
import Login from './pages/auth/Login'
import SetupProfile from './pages/auth/SetupProfile'

function BrowsePreview() {
  const { currentUser, signOut } = useContext(AuthContext)

  return (
    <main className="auth-page">
      <h1>Browse</h1>
      <p>Temporary screen for testing authentication.</p>

      {currentUser ? (
        <>
          <p>Signed in as: {currentUser.email}</p>
          <p>Display name: {currentUser.displayName}</p>
          <p>Campus area: {currentUser.campusArea}</p>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </>
      ) : (
        <p>No user is signed in.</p>
      )}

      <nav>
        <Link to="/">Back to Welcome</Link>
      </nav>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup-profile" element={<SetupProfile />} />
        <Route path="/browse" element={<BrowsePreview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
