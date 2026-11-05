import { useState } from 'react'
import { useAppState } from '../data/useAppState.js'
import './EditProfile.css'
import roleChoices from '../../mocks/roles.json'

function EditProfile() {
    const appState = useAppState()
    if (appState.status === 'error') return <p role="alert">{appState.message}</p>
    if (appState.status === 'loading' || !appState.profile) return <p>Loading profile…</p>
    return <EditProfileForm key={appState.profile.id} profile={appState.profile} onSave={appState.saveProfile} />
}

function EditProfileForm({ profile, onSave }) {
    const [draft, setDraft] = useState(() => ({ ...profile }))
    const [photoOpen, setPhotoOpen] = useState(false)
    const [photoChoice, setPhotoChoice] = useState('')
    const [skillInput, setSkillInput] = useState('')
    const [locationInput, setLocationInput] = useState('')

    function changeField(event) {
        setDraft({ ...draft, [event.target.name]: event.target.value })
    }
    function changeSkillInput(event) {
        setSkillInput(event.target.value)
    }
    function addSkill(event) {
        if (event.key !== 'Enter') return
        event.preventDefault()
        const skill = skillInput.trim()
        if (skill === '') return
        if (!draft.skills.includes(skill)) {
            setDraft({ ...draft, skills: draft.skills.concat(skill) })
        }
        setSkillInput('')
    }
    function removeSkill(skill) {
        setDraft({ ...draft, skills: draft.skills.filter((item) => item !== skill) })
    }
    function changeLocationInput(event) {
        setLocationInput(event.target.value)
    }

    function addLocation(event) {
        if (event.key !== 'Enter') return
        event.preventDefault()
        const location = locationInput.trim()
        if (location === '') return
        if (!draft.locations.includes(location)) {
            setDraft({ ...draft, locations: draft.locations.concat(location) })
        }
        setLocationInput('')
    }

    function removeLocation(location) {
        setDraft({ ...draft, locations: draft.locations.filter((item) => item !== location) })
    }

    function toggleRole(role) {
        const lookingFor = draft.lookingFor.includes(role)
            ? draft.lookingFor.filter((item) => item !== role)
            : draft.lookingFor.concat(role)
        setDraft({ ...draft, lookingFor: lookingFor })
    }

    function openPhoto() {
        setPhotoChoice('')
        setPhotoOpen(true)
    }

    function closePhoto() {
        setPhotoChoice('')
        setPhotoOpen(false)
    }

    function takePhoto() {
        setPhotoChoice('https://picsum.photos/seed/careerhive-camera/80/80')
    }

    function chooseAlbum() {
        setPhotoChoice('https://picsum.photos/seed/careerhive-album/80/80')
    }

    function updatePhoto() {
        if (photoChoice !== '') {
            setDraft({ ...draft, photo: photoChoice })
        }
        closePhoto()
    }

    function saveEdit() {
        onSave(draft)
        window.location.hash = '#/profile'
    }

    function cancelEdit() {
        window.location.hash = '#/profile'
    }

    return (
    <section className="edit-profile">
    <a href="#/profile">Back to profile</a>
    <h1>Edit Profile</h1>
    <img src={draft.photo} alt="" width="72" height="72" />
    <button type="button" onClick={openPhoto}>Change photo</button>

    <label>
        Full name
    <input name="name" value={draft.name} onChange={changeField} />
    </label>
    <label>
        Major
    <input name="major" value={draft.major} onChange={changeField} />
    </label>
    <label>
        Graduation date
    <input name="graduationDate" value={draft.graduationDate} onChange={changeField} />
    </label>

    <label>
        Work authorization
        <input name="workAuthorization" value={draft.workAuthorization} onChange={changeField} />
    </label>
    <label>
        Skills
        <input value={skillInput} onChange={changeSkillInput} onKeyDown={addSkill} />
    </label>
    <ul className="skill-tags">
        {draft.skills.map((skill) => (
            <li key={skill}>
                <button type="button" onClick={() => removeSkill(skill)}>{skill}</button>
            </li>
        ))}
    </ul>

    <label>
    Locations
        <input value={locationInput} onChange={changeLocationInput} onKeyDown={addLocation} />
    </label>
    <ul className="skill-tags">
        {draft.locations.map((location) => (
            <li key={location}>
                <button type="button" onClick={() => removeLocation(location)}>{location}</button>
            </li>
        ))}
    </ul>

    <button type="button" className="ui-button ui-button-secondary" onClick={cancelEdit}>Cancel</button>
    <button type="button" className="ui-button" onClick={saveEdit}>Save Changes</button>
    {photoOpen && (
    <div className="photo-dialog">
        <div>
        <button type="button" onClick={closePhoto}>Close</button>
        <img src={photoChoice || draft.photo} alt="" width="72" height="72" />
        <button type="button" onClick={takePhoto}>Take Photo Now</button>
        <button type="button" onClick={chooseAlbum}>Choose from Album</button>
        <button type="button" onClick={closePhoto}>Cancel</button>
        <button type="button" onClick={updatePhoto}>Update</button>
        </div>
    </div>
    )}
    </section>
  )
}

export default EditProfile