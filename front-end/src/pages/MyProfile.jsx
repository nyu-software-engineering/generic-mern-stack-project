import { useAppState } from '../data/AppState.jsx'

function MyProfile() {
  const appState = useAppState()
  const profile = appState.profile

  if (appState.status === 'loading' || !profile) return <p>Loading profile…</p>
  if (appState.status === 'error') return <p>{appState.message}</p>

  return (
    <section>
      <h1>My Profile</h1>
      <img src={profile.photo} alt="" width="72" height="72" />
      <p>{profile.workAuthorization}</p>
      <p>{profile.skills.join(', ')}</p>
      <p>{profile.lookingFor.join(', ')}</p>
      <p>{profile.locations.join(', ')}</p>
      <a href="#/profile/edit">Edit Profile</a>
    </section>
  )
}

export default MyProfile