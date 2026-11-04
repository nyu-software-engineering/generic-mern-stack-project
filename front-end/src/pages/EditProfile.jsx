import { useState } from "react";
import { Link } from "react-router";
import mockProfile, { allInterests } from "../mocks/mockProfile";
import "./EditProfile.css";

// Edit Profile page (#46): update the profile using React state.
// Saving writes the changes back into the shared mock profile,
// so the My Profile page shows the updated information.
export default function EditProfile() {
  // One state variable for each field, starting with the current profile.
  const [name, setName] = useState(mockProfile.name);
  const [location, setLocation] = useState(mockProfile.location);
  const [bio, setBio] = useState(mockProfile.bio);
  const [interests, setInterests] = useState(mockProfile.interests);
  const [saved, setSaved] = useState(false);

  // Add the interest if it is not picked yet, remove it if it is.
  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((item) => item !== interest));
    } else {
      setInterests([...interests, interest]);
    }
    setSaved(false);
  };

  // Runs when the user clicks Save.
  const handleSubmit = (e) => {
    e.preventDefault(); // stop the browser from reloading the page

    // Write the changes back into the shared mock profile.
    mockProfile.name = name;
    mockProfile.location = location;
    mockProfile.bio = bio;
    mockProfile.interests = interests;

    setSaved(true);
  };

  return (
    <main className="edit-profile-page">
      <div className="doin-card edit-profile-card">
        <h1 className="edit-profile-title">Edit profile</h1>

        <form onSubmit={handleSubmit}>
          <div className="edit-profile-field">
            <label htmlFor="name_field">Name:</label>
            <input
              className="doin-input edit-profile-input"
              id="name_field"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="edit-profile-field">
            <label htmlFor="location_field">Location:</label>
            <input
              className="doin-input edit-profile-input"
              id="location_field"
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="edit-profile-field">
            <label htmlFor="bio_field">Bio:</label>
            <input
              className="doin-input edit-profile-input"
              id="bio_field"
              type="text"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <p className="edit-profile-label">Interests:</p>
          <div className="edit-profile-interests">
            {allInterests.map((interest) => (
              <button
                type="button"
                key={interest}
                className={
                  interests.includes(interest)
                    ? "edit-profile-interest edit-profile-interest-on"
                    : "edit-profile-interest"
                }
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>

          {saved && <p className="edit-profile-saved">Saved!</p>}

          <div className="edit-profile-actions">
            <button type="submit" className="doin-button doin-button--primary">
              Save
            </button>
            <Link to="/profile" className="doin-button doin-button--secondary">
              Back to profile
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
