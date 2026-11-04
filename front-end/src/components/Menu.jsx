import { useEffect } from 'react'
import { useAppState } from '../data/AppState.jsx'
import './Menu.css'

const LINKS = [
  { href: '#/jobs', label: 'Browse Jobs' },
  { href: '#/tracker', label: 'My Tracker' },
  { href: '#/profile', label: 'My Profile' },
]

function Menu({ onClose }) {
  const { profile } = useAppState()

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="menu" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" className="menu-backdrop" aria-label="Close menu" onClick={onClose} />
      <nav className="menu-panel">
        <button type="button" className="menu-close" onClick={onClose} autoFocus>Close</button>
        {profile && (
          <div className="menu-user">
            <img src={profile.photo} alt="" width="56" height="56" />
            <div>
              <strong>{profile.name}</strong>
              <p>{profile.email}</p>
            </div>
          </div>
        )}
        {LINKS.map((link) => (
          <a key={link.href} className="menu-link" href={link.href} onClick={onClose}>{link.label}</a>
        ))}
        <a className="menu-link menu-logout" href="#/welcome" onClick={onClose}>Log Out</a>
      </nav>
    </div>
  )
}

export default Menu
