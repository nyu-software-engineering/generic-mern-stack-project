import {Link} from "react-router-dom"
import "./Profile.css"

const postID = [1,2,3,4,5,6]
const Profile = ({user}) => {
    const fullName = `${user.name.first} ${user.name.last}`
    
    return (
        <main className = "profile-page">
            <header className = "profile-header">
                <span className="profile-brand">HobbyHub</span>
                <Link to="/chat" className="profile-chat">
                    Chat
                </Link>
            </header>

            <section className="profile-content">
                <div className ="profile-top">
                    <img
                      className="profile-picture"
                      src={user.picture.large}
                      alt={`${fullName}'s profile`}
                      />
                      <Link
                        to="/profile/settings"
                        className="profile-settings-link"
                        aria-label="Profile settings"
                        >    
                             ⚙
                        </Link>
                </div>
                <h1 className="profile-name">{fullName}</h1>
                <p className="profile-username"> @{user.login.username}</p>

                <section className="profile-hobbies">
                    <h2 className="profile-section-title">Hobbies</h2>
                    {user.hobbies && user.hobbies.length > 0 ?(
                        <ul className="profile-hobby-list">
                            {user.hobbies.map(hobby =>(
                                <li className="profile-hobby-item" key={hobby}>
                                    {hobby}
                                </li>
                            ))}
                        </ul>
                    ):(
                      <p className="profile-empty-hobbies">
                        No hobbies added yet. Please add the hobbies your intrested in on the settings page.
                    </p>   
                    )}
                </section>

                <Link 
                  to="/profile/settings"
                  className="profile-edit-button"
                  >
                    Edit Profile
                  </Link>

                  <section className="profile-posts">
                    <h2 className="profile-posts-title">Posts</h2>
                    <div className="profile-post-grid">
                        {postID.map(id=> (
                            <img
                              key={id}
                              className="profile-post-image"
                              src={`https://picsum.photos/seed/hobbyhub-${id}/300/300`}
                              alt={`Mock post ${id}`}
                            />
                        ))}
                    </div>
                  </section>
            </section>

            <nav className="profile-navigation" aria-label="Main navigation">
                <Link to="/feed" className="profile-nav-item">
                        Feed
                </Link>
                <Link to="/discover" className="profile-nav-item">
                        Discover
                </Link>
                <Link to="/following" className="profile-nav-item">
                        Following
                </Link>
                <Link to="/map" className="profile-nav-item">
                        Map
                </Link>
                <Link to="/profile" className="profile-nav-item profile-nav-active">
                        Profile
                </Link>
            </nav>
        </main>
    )
}

export default Profile