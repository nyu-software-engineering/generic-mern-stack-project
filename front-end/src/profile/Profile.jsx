import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EditProfile from './EditProfile'
import ProfilePicture from './ProfilePicture'
import './Profile.css'

function Profile({ setCurrentUser, setIsLoggedIn }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)

  const logOut = () => {
    fetch('/api/profile/logout', {
      method: 'POST',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to logout')
        setIsLoggedIn(false)
        navigate('/login')
      })
      .catch(err => console.error(err))
  }
  const callProfile = () => {
    fetch('/api/profile')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile')
        return res.json()
      })
      .then(saveProfile)
      .catch(err => console.error(err))
  }

  const navigate = useNavigate()

  useEffect(() => {
    callProfile()
  }, [])

  // send the edited profile to the back-end
  function saveProfile(updated) {
    setProfile(updated)
    setEditing(false)
    setCurrentUser(prev => ({
      ...prev, 
      ...updated
    }))
  }

  if (!profile) {
    return <div className="profile-page">Loading profile...</div>
  }

  if (editing) {
    return (
      <EditProfile
        profile={profile}
        onSave={saveProfile}
        onCancel={() => setEditing(false)}
        callProfile={callProfile}
      />
    )
  }

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      <div className="profile-header">
        <ProfilePicture src={profile.picture} />
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.bio}</p>
        </div>
      </div>

      <button type="button" className="profile-btn-outline" onClick={() => setEditing(true)}>
        Edit Profile
      </button>

      <ul className="profile-links">
        <li>
          <button type="button" onClick={() => navigate('/profile/posts')}>View All Posts <span>›</span></button>
        </li>
        <li>
          <button type="button" onClick={() => navigate('/profile/settings')}>Account settings <span>›</span></button>
        </li>
      </ul>

      <button
        type="button"
        className="profile-btn-solid"
        onClick={() => {
          logOut()
        }}
      >
        Log Out
      </button>

    </div>
  )
}

export default Profile
