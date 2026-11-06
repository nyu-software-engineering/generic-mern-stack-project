import{useState} from "react"
import {Link} from "react-router-dom"
import "./ProfileSettings.css"

const ProfileSettings = ({user, onUpdateUser}) => {
    const[activeSection, setActiveSection] = useState(null)
    const[firstName, setFirstName] = useState(user.name.first)
    const[lastName, setLastName] = useState(user.name.last)
    const[username, setUsername] = useState(user.login.username)
    const[hobby, setHobby] = useState("")
    const[pictureLoading, setPictureLoading] = useState(false)
    const[pictureError, setPictureError] = useState("")

    const hobbies = user.hobbies || [] 
    const privacy = user.privacy || "public"
    
    const privacyEdit = event => {
        onUpdateUser(previousUser => ({
            ...previousUser,
            privacy: event.target.value,
        }))
    }
    
    const profileSave = event => {
        event.preventDefault()
        onUpdateUser(previousUser => ({
            ...previousUser,
            name: {
                ...previousUser.name,
                first: firstName.trim(),
                last: lastName.trim(),
            },
            login: {
                ...previousUser.login,
                username: username.trim(),
            },
        }))
        setActiveSection(null)
    }

    const addHobby = event => {
        event.preventDefault()
        const newHobby = hobby.trim()
        if(!newHobby||hobbies.includes(newHobby)){
                return
            }
            onUpdateUser(previousUser => ({
                ...previousUser,
                hobbies: [...(previousUser.hobbies || []), newHobby],
            }))
            setHobby("")
    }

    const removeHobby = hobbyToRemove => {
        onUpdateUser(previousUser => ({
            ...previousUser,
            hobbies: (previousUser.hobbies||[]).filter(
                item => item !== hobbyToRemove
            ),
        }))
    }

    const picChange = async () => {
        setPictureLoading(true)
        setPictureError("")
        try{
            const response = await fetch ("https://randomuser.me/api/")
            if(!response.ok){
                throw new Error("Failed to load picture")
            }
            const data = await response.json()
            onUpdateUser(previousUser => ({
                ...previousUser,
                picture: data.results[0].picture,
            }))
        } catch {
            setPictureError("Cannot change picture now. Try again later.")
        } finally {
            setPictureLoading(false)
        }
    }

    return (
        <main className="settings-page">
            <header className="settings-header">
                <Link to="/profile" className="settings-back">
                    Back
                </Link>
                <h1 className="settings-title">Profile Settings</h1>
            </header>

            <div className="settings-content">
                <fieldset className="settings-privacy">
                    <legend className="settings-section-title">Privacy</legend>
                    <label className="settings-privacy-option">
                        <input
                            type="radio"
                            name="privacy"
                            value="public"
                            checked={privacy === "public"}
                            onChange={privacyEdit}
                        />
                        <span className="settings-privacy-text">
                            <strong>Public</strong>
                            <span>Your profile, posts and hobbies can be viewed by anyone</span>
                        </span>
                    </label>

                    <label className="settings-privacy-option">
                        <input
                        type="radio"
                        name="privacy"
                        value="private"
                        checked={privacy === "private"}
                        onChange={privacyEdit}
                        />
                        <span className="settings-privacy-text">
                            <strong>Private</strong>
                            <span>You can only be viewed by accepted people</span>
                        </span>
                    </label>
                </fieldset>

                <section className="settings-menu">
                    <button
                    type="button"
                    className="settings-menu-button"
                    onClick={()=> setActiveSection("edit")}
                    >
                        <span className="settings-menu-icon">✎</span>
                        <span>Edit profile</span>
                        <span className="settings-menu-arrow">›</span>
                    </button>
                    <button
                        type="button"
                        className="settings-menu-button"
                        onClick={()=> setActiveSection("hobbies")}
                        >
                            <span className="settings-menu-icon">+</span>
                            <span>Manage hobbies</span>
                            <span className="settings-menu-arrow">›</span>
                        </button>
                        <button
                            type="button"
                            className="settings-menu-button"
                            onClick={() => setActiveSection("picture")}
                        >
                            <span className="settings-menu-icon">▣</span>
                            <span>Change profile picture</span>
                            <span className="settings-menu-arrow">›</span>
                        </button>
                </section>
                
                {activeSection === "edit" && (
                    <form className="settings-panel" onSubmit={profileSave}>
                        <h2 className ="settings-panel-title">Edit Profile</h2>
                        <label className="settings-label" htmlFor="first-name">
                            FirstName
                        </label>
                        <input
                            className="settings-input"
                            id={firstName}
                            onChange={event => setFirstName(event.target.value)}
                            required
                        />
                        <label className="settings-label" htmlFor="last-name">
                            Last Name
                        </label>
                        <input
                            className="settings-input"
                            id="last-name"
                            value={lastName}
                            onChange={event => setLastName(event.target.value)}
                            required
                        />
                        <label className ="settings-label" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="settings-input"
                            id="username"
                            value={username}
                            onChange={event => setUsername(event.target.value)}
                            required
                        />
                        <button className="settings-save-button" type ="submit">
                            Save Changes
                        </button>
                    </form>
                )}

                {activeSection === "hobbies" && (
                    <section className="settings-panel">
                       <h2 className="settings-panel-title">Manage Hobbies</h2>
                       <form onSubmit={addHobby}>
                            <label className="settings-label" htmlFor="new-hobby">
                                Add a Hobby
                            </label>
                            <input
                                className="settings-input"
                                id="new-hobby"
                                value={hobby}
                                onChange={event => setHobby(event.target.value)}
                                placeholder="Enter a hobby"
                            />
                            <button className="settings-save-button" type="submit">
                                Add Hobby
                            </button>
                       </form>
                       <ul className="settings-hobby-list">
                        {hobbies.map(item=>(
                          <li className="settings-hobby-item" key={item}>
                             <span>{item}</span>
                             <button
                                className="settings-remove-button"
                                type="button"
                                onClick={() => removeHobby(item)}
                                aria-label={`Remove ${item}`}
                            >
                                Remove
                            </button>
                          </li>
                        ))}
                       </ul>
                    </section>
                )}
                {activeSection === "picture" && (
                    <section className="settings-panel">
                        <h2 className="settings-panel-title">
                            Change profile picture
                        </h2>
                        <img
                            className="settings-profile-picture"
                            src={user.picture.large}
                            alt="Current profile"
                        />
                        <button
                            className="settings-save-button"
                            type="button"
                            onClick={picChange}
                            disabled={pictureLoading}
                        >
                            {pictureLoading ? "Loading..." : "Generate New Picture"}
                        </button>
                        {pictureError && (
                            <p className="settings-error">{pictureError}</p>
                        )}
                    </section>
                )}
            </div>

            <nav className="settings-navigation" aria-label="Main navigation">
                <Link to="/feed" className="settings-nav-item">
                        Feed
                </Link>
                <Link to="discover" className="settings-nav-item">
                        Discover
                </Link>
                <Link to="following" className="settings-nav-item">
                        Following
                </Link>
                <Link to="map" className="settings-nav-item">
                        Map
                </Link>
                <Link to="profile" className="settings-active-nav">
                        Profile
                </Link>
            </nav>
        </main>
    )
}

export default ProfileSettings