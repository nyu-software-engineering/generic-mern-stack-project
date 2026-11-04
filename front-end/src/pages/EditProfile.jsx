import { useEffect, useState } from 'react'
import { useAppState } from '../data/AppState.jsx'
import './EditProfile.css'

function EditProfile() {
    const appState = useAppState()
    const [draft, setDraft] = useState(null)
    const [photoOpen, setPhotoOpen] = useState(false)
    const [photoChoice, setPhotoChoice] = useState('')

  useEffect(() => {
    if (!appState.profile) return
    setDraft({
      ...appState.profile,
      skillsText: appState.profile.skills.join(', '),
      locationsText: appState.profile.locations.join(', '),
    })
  }, [appState.profile])

  if (appState.status === 'loading' || !draft) return <p>Loading profile…</p>
  if (appState.status === 'error') return <p>{appState.message}</p>

    function changeField(event) {
        setDraft({ ...draft, [event.target.name]: event.target.value })
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
    appState.saveProfile({
      ...draft,
      skills: draft.skillsText.split(',').map((item) => item.trim()).filter((item) => item !== ''),
      locations: draft.locationsText.split(',').map((item) => item.trim()).filter((item) => item !== ''),
    })
    window.location.hash = '#/profile'
    }

    function cancelEdit() {
        window.location.hash = '#/profile'
    }

    return (
    <section className="edit-profile">
      <h1>Edit Profile</h1>
      <img src={draft.photo} alt="" width="72" height="72" />
      <button type="button" className="ui-button ui-button-secondary" onClick={openPhoto}>Change photo</button>

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
        <input name="skillsText" value={draft.skillsText} onChange={changeField} />
    </label>
    <label>
        Locations
    <input name="locationsText" value={draft.locationsText} onChange={changeField} />
    </label>
    <label>
        <input type="checkbox" checked={draft.lookingFor.includes('Internships')} onChange={() => toggleRole('Internships')} />
        Internships
    </label>
    <label>
        <input type="checkbox" checked={draft.lookingFor.includes('Full-time entry-level roles')} onChange={() => toggleRole('Full-time entry-level roles')} />
        Full-time entry-level roles
    </label>

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