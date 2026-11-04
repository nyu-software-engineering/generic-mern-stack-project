import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import './Profile.css'
import './EditProfile.css'

const PLACEHOLDER_PHOTO = 'https://picsum.photos/200/200'

export default function EditProfile(props) {
    const navigate = useNavigate()

    const [fullName, setFullName] = useState(props.profile.full_name)
    const [bio, setBio] = useState(props.profile.bio)
    const [university, setUniversity] = useState(props.profile.university)
    const [email, setEmail] = useState(props.profile.email)
    const [photo, setPhoto] = useState(props.profile.profile_picture)

    function handlePhotoChange(event) {
        const file = event.target.files[0]
        if (file) {
            setPhoto(URL.createObjectURL(file))
        }
    }

    function handleSubmit(event) {
        event.preventDefault()
        props.setProfile({
            ...props.profile,
            full_name: fullName.trim(),
            bio: bio.trim(),
            university: university.trim(),
            email: email.trim().toLowerCase(),
            profile_picture: photo,
        })
        navigate('/profile')
    }

    return (
        <form className="edit-profile" onSubmit={handleSubmit}>
            <h1>Edit Profile</h1>
            <img className="edit-profile-photo" src={photo} alt="Profile" />

            <div className="profile-button-row">
                <label className="profile-button">
                    Upload photo
                    <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                </label>
                <button className="profile-button" type="button" onClick={() => setPhoto(PLACEHOLDER_PHOTO)}>
                    Remove photo
                </button>
            </div>

            <label className="edit-profile-field">
                <span>Full name</span>
                <input value={fullName} onChange={event => setFullName(event.target.value)} required />
            </label>

            <label className="edit-profile-field">
                <span>Bio</span>
                <textarea rows="3" value={bio} onChange={event => setBio(event.target.value)} />
            </label>

            <label className="edit-profile-field">
                <span>University</span>
                <input value={university} onChange={event => setUniversity(event.target.value)} required />
            </label>

            <label className="edit-profile-field">
                <span>University email</span>
                <input type="email" value={email} onChange={event => setEmail(event.target.value)} required />
            </label>

            <p className="edit-profile-note">Changing your .edu email requires university verification.</p>

            <button className="profile-button" type="submit">Save Profile</button>
            <Link className="profile-button" to="/profile">Cancel</Link>
        </form>
    )
}
