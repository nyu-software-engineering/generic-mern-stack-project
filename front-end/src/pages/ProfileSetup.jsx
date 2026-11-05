import { useAppState } from '../data/useAppState.js'

function ProfileSetup() {
    const appState = useAppState()
    const profile = appState.profile

    if (appState.status === 'error') return <p role="alert">{appState.message}</p>
    if (appState.status === 'loading' || !profile) return <p>Loading profile…</p>

    function skipProfile() {
        window.location.hash = '#/home'
    }

    return (
        <section className="auth">
            <h1>Set Up Your Profile</h1>
            <p className="auth-lead">This helps us match you with the right roles.</p>

            <label>
                Major
                <input className="ui-field" value={profile.major} readOnly />
            </label>
            <label>
                Graduation date
                <input className="ui-field" value={profile.graduationDate} readOnly />
            </label>
            <p>Skills</p>
            {profile.skills.length === 0 ? <p>Not added yet</p> : <p>{profile.skills.join(', ')}</p>}
            <p>Looking for</p>
            {profile.lookingFor.length === 0 ? <p>Not added yet</p> : <p>{profile.lookingFor.join(', ')}</p>}
            <p>Preferred locations</p>
            {profile.locations.length === 0 ? <p>Not added yet</p> : <p>{profile.locations.join(', ')}</p>}
            <label>
                Work authorization
                <input className="ui-field" value={profile.workAuthorization} readOnly />
            </label>

            <button className="ui-button" type="button" onClick={skipProfile}>Skip for now</button>
        </section>
    )
}

export default ProfileSetup