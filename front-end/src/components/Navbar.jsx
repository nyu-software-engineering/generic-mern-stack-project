
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { CURRENT_USER_ID } from '../services/mockDataService.js'
import './Navbar.css'

function Navbar() {
  const { currentUser, signOut } = useContext(AuthContext)
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <header className="ds-header">
      <nav className="ds-header-inner" aria-label="Main navigation">
        <Link to="/" className="ds-header-brand">
          DormShare
        </Link>

        {currentUser && (
          <div className="ds-header-actions">
            <Link
              to={`/users/${CURRENT_USER_ID}/reputation`}
              className="ds-header-link"
            >
              Demo reputation
            </Link>

            <button
              type="button"
              className="ds-header-signout"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
