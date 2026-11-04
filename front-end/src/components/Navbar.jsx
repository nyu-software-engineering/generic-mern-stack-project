import { useContext } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { CURRENT_USER_ID } from '../services/mockDataService.js'
import './Navbar.css'

function Navbar() {
  const { currentUser, signOut } = useContext(AuthContext)
  const navigate = useNavigate()

  const links = [
    { name: 'Browse', path: '/browse' },
    { name: 'Requests', path: '/requests-board' },
    { name: 'List', path: '/listings/new' },
    { name: 'Messages', path: '/inbox' },
    { name: 'Profile', path: '/profile' },
    {
      name: 'Demo reputation',
      path: `/users/${CURRENT_USER_ID}/reputation`,
    },
  ]

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <header className="ds-navbar">
      <nav className="ds-navbar-inner" aria-label="Main navigation">
        <Link
          to={currentUser ? '/browse' : '/'}
          className="ds-navbar-brand"
        >
          DormShare
        </Link>

        {currentUser && (
          <div className="ds-navbar-actions">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  isActive ? 'ds-navbar-link ds-navbar-link--active' : 'ds-navbar-link'
                }
              >
                {link.name}
              </NavLink>
            ))}

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