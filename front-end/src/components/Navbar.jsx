
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
    <header className="ds-navbar">
      <nav className="ds-navbar-inner" aria-label="Main navigation">
        <Link to="/" className="ds-navbar-brand">
          DormShare
        </Link>

        {currentUser && (
          <div className="ds-navbar-actions">
            <Link to="/browse" className="ds-navbar-link">
              Browse
            </Link>

            <Link
              to={`/users/${CURRENT_USER_ID}/reputation`}
              className="ds-navbar-link"
            >
              Demo reputation
            </Link>

            <button
              type="button"
              className="ds-navbar-signout"
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
