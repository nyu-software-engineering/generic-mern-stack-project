import { useEffect, useState } from 'react'
import { useAppState } from '../data/AppState.jsx'
import './EditProfile.css'

function EditProfile() {
  const appState = useAppState()
  const [draft, setDraft] = useState(null)

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

  function stagePhoto() {
    setDraft({ ...draft, photo: 'https://picsum.photos/seed/careerhive-profile-draft/80/80' })
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
      <button type="button" className="ui-button ui-button-secondary" onClick={stagePhoto}>Stage photo</button>

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
        <input type="checkbox" checked={draft.lookingFor.includes('Internships')} onChange={toggleInternships} />
        Internships
      </label>

      <button type="button" className="ui-button ui-button-secondary" onClick={cancelEdit}>Cancel</button>
      <button type="button" className="ui-button" onClick={saveEdit}>Save Changes</button>
    </section>
  )
}

export default EditProfile