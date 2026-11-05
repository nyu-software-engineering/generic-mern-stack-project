import { useEffect, useRef } from 'react'
import { useAppState } from '../data/useAppState.js'
import './Menu.css'

const LINKS = [
  { href: '#/jobs', label: 'Browse Jobs' },
  { href: '#/tracker', label: 'My Tracker' },
  { href: '#/profile', label: 'My Profile' },
]

function Menu({ onClose, onLogOut }) {
  const { profile } = useAppState()
  const dialogRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    closeRef.current.focus({ preventScroll: true })
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  function closeFromBackdrop(event) {
    if (event.target !== event.currentTarget) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      onClose()
    }
  }

  return (
    <dialog className="menu" ref={dialogRef} aria-label="Menu"
      onCancel={(event) => { event.preventDefault(); onClose() }} onClick={closeFromBackdrop}>
      <nav className="menu-panel">
        <button ref={closeRef} type="button" className="menu-close" onClick={onClose}>Close</button>
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
        <a className="menu-link menu-logout" href="#/welcome" onClick={(event) => { event.preventDefault(); onLogOut() }}>Log Out</a>
      </nav>
    </dialog>
  )
}

export default Menu
