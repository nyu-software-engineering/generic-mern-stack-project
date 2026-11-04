import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import mockProfile from "../mocks/mockProfile";
import "./SetupProfile.css";

export default function SetupProfile() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const navigate = useNavigate();
  const routeLocation = useLocation();

  function handlePhotoChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhotoPreview(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function handleFinish(event) {
    event.preventDefault();

    if (!username.trim()) {
      return;
    }

    mockProfile.username = username.trim();
    mockProfile.bio = bio.trim();
    mockProfile.location = location.trim();
    mockProfile.availability = availability.trim();
    mockProfile.interests = routeLocation.state?.interests ?? [];

    if (photoPreview) {
      mockProfile.imageUrl = photoPreview;
    }

    navigate("/profile");
  }

  return (
    <main className="setup-profile-page">
      <div className="setup-profile-container">
        <header className="setup-profile-header">
          <h1>Set up your profile</h1>
        </header>

        <form onSubmit={handleFinish} className="setup-profile-form">
          <div className="setup-profile-photo">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Your profile preview"
                className="setup-profile-avatar"
              />
            ) : (
              <div className="setup-profile-avatar" />
            )}

            <label htmlFor="profile-photo">Add photo</label>

            <input
              id="profile-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="setup-profile-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="doin-input setup-profile-input"
              placeholder="Choose a username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className="setup-profile-field">
            <label htmlFor="bio">Short bio</label>
            <textarea
              id="bio"
              className="doin-input setup-profile-input"
              placeholder="Tell us a little about yourself"
              rows="3"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </div>

          <div className="setup-profile-field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              className="doin-input setup-profile-input"
              placeholder="e.g. New York, NY"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <div className="setup-profile-field">
            <label htmlFor="availability">Availability (optional)</label>
            <input
              id="availability"
              type="text"
              className="doin-input setup-profile-input"
              placeholder="e.g. Weekends and weekday evenings"
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="doin-button doin-button--primary setup-profile-finish"
          >
            Finish setup
          </button>
        </form>
      </div>
    </main>
  );
}
