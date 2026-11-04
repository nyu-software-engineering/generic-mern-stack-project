import { useAppState } from '../data/useAppState.js'

function MyProfile() {
  const appState = useAppState()
  const profile = appState.profile

  if (appState.status === 'error') return <p role="alert">{appState.message}</p>
  if (appState.status === 'loading' || !profile) return <p>Loading profile…</p>

  return (
    <section>
      <h1>My Profile</h1>
      <img src={profile.photo} alt="" width="72" height="72" />
      <p>{profile.name}</p>
      <p>{profile.workAuthorization}</p>
      <p>{profile.skills.join(', ')}</p>
      <p>Looking for: {profile.lookingFor.join(', ')}</p>
      <p>{profile.locations.join(', ')}</p>
      <a href="#/profile/edit">Edit Profile</a>
    </section>
  )
}

export default MyProfile