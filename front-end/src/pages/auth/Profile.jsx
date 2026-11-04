import { useContext } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { CURRENT_USER_ID } from '../../services/mockDataService.js'
import '../booking/booking.css'
import './profile.css'

// Profile (M29): identity card for the signed-in user plus links to their own screens.
function Profile() {
  const { currentUser, signOut } = useContext(AuthContext)
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  if (!currentUser) return <Navigate to="/login" replace />

  return (
    <main className="booking-page">
      <h1>Profile</h1>

      <div className="booking-card">
        <h2>{currentUser.displayName || currentUser.email} · Verified NYU</h2>
        {/* Ratings and rental counts live in the shared mock data, which has no record for new accounts. */}
        <p>Not rated yet · 0 completed rentals</p>
        <p>{currentUser.email}</p>
        {currentUser.campusArea && <p>{currentUser.campusArea}</p>}
      </div>

      <section className="profile-section">
        <h2>As a renter</h2>
        <p className="booking-note">Borrow items from other students.</p>
        <div className="booking-actions">
          <Link to="/requests-board" className="booking-btn booking-btn--primary">My requests</Link>
          <Link to="/renter-dashboard" className="booking-btn">Renter dashboard</Link>
        </div>
      </section>

      <section className="profile-section">
        <h2>As an owner</h2>
        <p className="booking-note">Lend your items to other students.</p>
        <div className="booking-actions">
          <Link to="/listings" className="booking-btn booking-btn--primary">My listings</Link>
          <Link to="/owner-dashboard" className="booking-btn">Owner dashboard</Link>
        </div>
      </section>

      <section className="profile-section">
        <h2>Account</h2>
        <div className="booking-actions">
          <Link to={`/users/${CURRENT_USER_ID}/reputation`} className="booking-btn">
            View reputation profile
          </Link>
        </div>
        <p className="profile-links">
          <Link to="/inbox">Messages</Link>{' · '}
          <Link to="/community-rules">Community rules</Link>{' · '}
          <Link to="/report">Report a problem</Link>{' · '}
          <Link to="/setup-profile">Edit profile</Link>{' · '}
          <button type="button" className="profile-signout" onClick={handleSignOut}>Sign out</button>
        </p>
      </section>
    </main>
  )
}

export default Profile
