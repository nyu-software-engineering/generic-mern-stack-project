import mockProfile from "../mocks/mockProfile";
import "./Profile.css";

// My Profile page (#45): shows the user's own profile information.
export default function Profile() {
  return (
    <main className="profile-page">
      <div className="profile-container">
        <h1 className="profile-heading">My profile</h1>

        <img
          className="profile-photo"
          src={mockProfile.imageUrl}
          alt={mockProfile.name}
        />

        <h2 className="profile-name">{mockProfile.name}</h2>

        <p className="profile-details">
          {mockProfile.location} • {mockProfile.interests.join(" • ")}
        </p>

        <div className="profile-actions">
          <button className="profile-button profile-button-primary">
            Edit profile
          </button>
          <button className="profile-button">My events</button>
          <button className="profile-button">Settings</button>
        </div>

        <h2 className="profile-section-title">
          Your connections and hosted events
        </h2>
        <p className="profile-empty">Nothing here yet.</p>
      </div>
    </main>
  );
}
