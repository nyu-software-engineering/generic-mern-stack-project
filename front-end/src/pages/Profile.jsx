import ListingCard from "../components/ListingCard";
import ReviewCard from "../components/ReviewCard";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import React, { useState, useEffect } from "react";

export default function Profile(props) {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = props.user?.id || storedUser?.id || "user1";

  const [profile, setProfile] = useState(props.user || storedUser || null);
  const [savedListings, setSavedListings] = useState([]);
  const [activeListings, setActiveListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [mode, setMode] = useState("sublessor");
  const [loading, setLoading] = useState(true);
  
  const applications = props.applications || [];

  useEffect(() => {
    const headers = { "x-user-id": userId };

    async function loadProfile() {
      try {
        const [profileRes, savedRes, listingsRes, reviewsRes] =
          await Promise.all([
            fetch("/api/users/me", { headers }),
            fetch("/api/users/me/saved-listings", { headers }),
            fetch("/api/users/me/listings", { headers }),
            fetch("/api/users/me/reviews", { headers }),
          ]);

        setProfile(await profileRes.json());
        setSavedListings(await savedRes.json());

        const listingsData = await listingsRes.json();
        setActiveListings(listingsData.active || []);

        setReviews(await reviewsRes.json());
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  async function handleRemove(id) {
    try {
      const res = await fetch(`/api/users/me/listings/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
      });

      if (res.ok) {
        setActiveListings((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to remove listing:", err);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("user");
    if (props.onLogout) props.onLogout();
    navigate("/");
  }

  if (loading || !profile) {
    return <div className="page">Loading profile...</div>;
  }

  return (
    <div>

      <div className="page">
        <h2>Profile</h2>
        <div className="card">
          <div className="photo">
            {profile.photo ? (
              <img src={profile.photo} alt={profile.name} />
            ) : (
            "Profile photo" 
            )}
            </div>

            <h3>{profile.name}</h3>
          <p>{profile.bio}</p>
          <p className="muted">
            {profile.school} | {profile.city}
          </p>

          <div>
            <button
              className={mode === "subtenant" ? "active" : ""}
              onClick={function () {
                setMode("subtenant");
              }}
            >
              Subtenant Mode
            </button>

            <button
              className={mode === "sublessor" ? "active" : ""}
              onClick={function () {
                setMode("sublessor");
              }}
            >
              Sublessor Mode
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Verifications</h3>
          <ul className="verifications-list">
          {profile.verifications?.eduEmail && (
              <li>
                <strong>{profile.school || "Student"} Email Verified</strong> (.edu)
              </li>
            )}
            {profile.verifications?.govId && (
              <li>
                <strong>Government ID Verified</strong>
              </li>
            )}
            {profile.verifications?.phone && (
              <li>
                <strong>Phone Number Verified</strong>
              </li>
            )}

          </ul>
        </div>

        {mode === "subtenant" && (
          <div>
            <div className="section">
              <h3>Saved Sublets ({savedListings.length})</h3>
              {savedListings.length > 0 ? (
                <div className="listings-grid">
                  {savedListings.map(function (item) {
                    return <ListingCard key={item.id} listing={item} />;
                  })}
                </div>
              ) : (
                <p className="muted">
                  No saved listings yet. Explore listings to save your favorite spots.
                </p>
              )}
            </div>

            <div className="card">
              <h3>My Applications</h3>
              {applications.length > 0 ? (
                <div className="applications-list">
                  {applications.map((app) => (
                    <div key={app.id} className="application-item">
                    <div>
                      <strong className="app-title">{app.title}</strong>
                      <p className="muted app-details">
                        Host: {app.landlord} • {app.date}
                      </p>
                    </div>
                    <span className={`status-badge ${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </div>                 
                  ))}
                </div>
              ) : (
                <p className="muted">No active applications.</p>
              )}
            </div>
          </div>
        )}

        {mode === "sublessor" && (
          <div className="section">

            <div className="section-header">
              <h3>My Listings ({activeListings.length})</h3>
              <button
                className="primary-btn"
                onClick={() => navigate("/app/post")}
              >
                + Post a Sublet
              </button>
            </div>

            {activeListings.length > 0 ? (
              <div className="listings-grid">
                {activeListings.map((listing) => (
                    <div key={listing.id} className="listing-wrapper">
                      <ListingCard listing={listing} />
                      <button
                        className="remove-btn"
                        onClick={() => handleRemove(listing.id)}
                      >
                        Remove Listing
                      </button>
                    </div>
                ))}
              </div>
            ) : (
              <p className="muted">No listings available.</p>
            )}

          <div className="card">
          <h3>My Reviews</h3>
          <p className="muted">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>

              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}


        <div className="card">
          <h3>Account Settings</h3>
          <div className="settings-links">
            <button
              className="link-btn"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile Details
            </button>
            <button
              className="link-btn"
              onClick={() => navigate("/verification")}
            >
              ID & Student Verification
            </button>
            <button
              className="link-btn"
              onClick={() => navigate("/payment-methods")}
            >
              Payment Methods
            </button>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}