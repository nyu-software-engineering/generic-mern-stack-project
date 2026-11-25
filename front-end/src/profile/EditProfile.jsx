import { useEffect, useRef, useState } from 'react'
import ProfilePicture from './ProfilePicture'

function EditProfile({ profile, onSave, onCancel, callProfile, switchMode }) {
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [pictureFile, setPictureFile] = useState(undefined)
  const [picture, setPicture] = useState(profile.picture)
  const fileInput = useRef(null)


  const updateProfileData = (e) => {
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('bio', bio.trim())
    if(pictureFile){
      formData.append('image', pictureFile)
    }
    else{
      formData.append('image', undefined)
    }
      fetch('/api/profile', {
      method: 'POST',
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json()
        console.log(data)
        await callProfile()
        onSave(data)
      })
      .catch(() => console.error(err))
  }
  // free a preview that was never saved
  function discardPreview() {
    if (typeof picture === 'string' && picture.startsWith('blob:')) {
      URL.revokeObjectURL(picture)
    }
  }

  // Upload picture locally for display but save file for uploading to back-end
  async function handlePictureChange(e) {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) return
    discardPreview()
    setPictureFile(file)
    setPicture(URL.createObjectURL(file))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    console.log("submitting")
    updateProfileData()
  }

  function handleCancel() {
    discardPreview()
    onCancel()
  }

  return (
    <form className="profile-page" onSubmit={handleSubmit}>
      <h1>Edit Profile</h1>

      <div className="profile-pfp-upload">
        <ProfilePicture src={picture} />
        <button type="button" className="profile-btn-link" onClick={() => fileInput.current.click()}>
          Upload profile picture
        </button>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={handlePictureChange} />
      </div>

      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label>
        Bio (optional)
        <textarea rows="5" value={bio} onChange={(e) => setBio(e.target.value)} />
      </label>

      <button type="submit" className="profile-btn-solid">Save Changes</button>
      <button type="button" className="profile-btn-link" onClick={handleCancel}>Cancel</button>
    </form>
  )
}

export default EditProfile
