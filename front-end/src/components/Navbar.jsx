import { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Icon from './Icon.jsx'
import './Navbar.css'

const browse = { label: 'Browse', to: '/browse', icon: 'browse' }
const requests = { label: 'Requests', to: '/requests-board', icon: 'requests' }
const rentals = { label: 'Rentals', to: '/renter-dashboard', icon: 'rentals' }
const messages = { label: 'Messages', to: '/inbox', icon: 'messages' }
const profile = { label: 'Profile', to: '/profile', icon: 'profile' }
const notifications = { label: 'Notifications', to: '/notifications', icon: 'bell' }
const list = { label: 'List', to: '/listings/new', icon: 'plus' }
const desktopEntries = [browse, requests, rentals, messages, profile]
const mobileEntries = [browse, requests, list, messages, profile]

function NavigationLink({ entry, className = '', showIcon = false, iconOnly = false, children }) {
  const { pathname } = useLocation()
  const current = pathname === entry.to
    ? 'page'
    : entry.to === '/browse' && pathname.startsWith('/browse/')
      ? 'location'
      : undefined

  return (
    <Link
      to={entry.to}
      className={`ds-navbar-link ${className}`.trim()}
      aria-current={current}
      aria-label={iconOnly ? entry.label : undefined}
    >
      {(showIcon || iconOnly) && <Icon name={entry.icon} />}
      {!iconOnly && <span>{children || entry.label}</span>}
    </Link>
  )
}

function Navbar() {
  const { currentUser, signOut } = useContext(AuthContext)
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <>
      <header className="ds-navbar">
        <div className="ds-navbar-inner">
          <Link to={currentUser ? '/browse' : '/'} className="ds-navbar-brand">
            DormShare
          </Link>

          {currentUser && (
            <>
              <nav className="ds-desktop-nav" aria-label="Desktop navigation">
                <div className="ds-navbar-destinations">
                  {desktopEntries.map((entry) => (
                    <NavigationLink key={entry.to} entry={entry} />
                  ))}
                </div>
                <div className="ds-navbar-actions">
                  <NavigationLink entry={notifications} iconOnly className="ds-navbar-bell" />
                  <NavigationLink entry={list} showIcon className="ds-navbar-list">
                    List an item
                  </NavigationLink>
                  <button type="button" className="ds-navbar-signout" onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              </nav>

              <nav className="ds-mobile-header-nav" aria-label="Mobile header actions">
                <NavigationLink entry={rentals} className="ds-navbar-rentals" />
                <NavigationLink entry={notifications} iconOnly className="ds-navbar-bell" />
              </nav>
            </>
          )}
        </div>
      </header>

      {currentUser && (
        <nav className="ds-mobile-nav" aria-label="Mobile navigation">
          {mobileEntries.map((entry) => (
            <NavigationLink
              key={entry.to}
              entry={entry}
              showIcon
              className={entry === list ? 'ds-mobile-nav-list' : ''}
            />
          ))}
        </nav>
      )}
    </>
  )
}

export default Navbar
