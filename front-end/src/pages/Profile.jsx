import mockProfile from "../data/mockProfile";
import "./Profile.css";

// My Profile page (#45): shows the user's own profile information.
export default function Profile() {
  // The initials shown inside the photo circle, for example "AO" for Alp Ozbay.
  const initials = mockProfile.name
    .split(" ")
    .map((word) => word[0])
    .join("");

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-photo">{initials}</div>

        <h1 className="profile-name">{mockProfile.name}</h1>

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
