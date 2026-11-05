import { useAppState } from '../data/useAppState.js'

function MyProfile() {
    const appState = useAppState()
    const profile = appState.profile

    if (appState.status === 'error') return <p role="alert">{appState.message}</p>
    if (appState.status === 'loading' || !profile) return <p>Loading profile…</p>

    return (
        <section>
            <h1>My Profile</h1>
            {profile.photo === '' ? <div>user photo</div> : <img src={profile.photo} alt="" width="72" height="72" />}
            <p>{profile.name === '' ? 'Name not added yet' : profile.name}</p>
            <p>{profile.email === '' ? 'Email not added yet' : profile.email}</p>

            <h2>Education</h2>
            {profile.major === '' ? (
                <p>Not added yet</p>
            ) : (
                <p>{profile.degree} {profile.major}, {profile.school}. Expected graduation: {profile.graduationDate}</p>
            )}

            <h2>Skills</h2>
            <p>{profile.skills.length === 0 ? 'Not added yet' : profile.skills.join(', ')}</p>
            <h2>Looking for</h2>
            <p>{profile.lookingFor.length === 0 ? 'Not added yet' : profile.lookingFor.join(', ')}</p>
            <h2>Preferred locations</h2>
            <p>{profile.locations.length === 0 ? 'Not added yet' : profile.locations.join(', ')}</p>
            <h2>Work authorization</h2>
            <p>{profile.workAuthorization === '' ? 'Not added yet' : profile.workAuthorization}</p>

            <a href="#/profile/edit">Edit Profile</a>
        </section>
    )
}

export default MyProfile