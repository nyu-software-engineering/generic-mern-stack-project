import React, { useState } from "react";
import ListingCard from "../components/ListingCard";
import ReviewCard from "../components/ReviewCard";
import mockListings from "../mockListings";
import "./Profile.css";

const USER = {
  name: "Nana",
  email: "nana@nyu.edu",
};

const REVIEWS = [
  {
    id: 1,
    author: "Morgan",
    date: "October 2026",
    text: "Nana was easy to communicate with. The apartment was clean.",
  },
];

export default function Profile(props) {
  // set default props if not passed in
  let currentUser = props.user;
  if (!currentUser) {
    currentUser = USER;
  }

  let savedListings = props.savedListings;
  if (!savedListings) {
    savedListings = [mockListings[0], mockListings[1]];
  }

  let applications = props.applications;
  if (!applications) {
    applications = [
      {
        id: 1,
        title: "Studio in East Village",
        landlord: "Sarah M.",
        status: "Pending",
        date: "May 1 - Aug 31",
      },
      {
        id: 2,
        title: "1BR in Williamsburg",
        landlord: "David K.",
        status: "Approved",
        date: "Jun 1 - Aug 15",
      },
    ];
  }

  const [mode, setMode] = useState("sublessor");
  const [removedListings, setRemovedListings] = useState([]);

  function handleRemove(id) {
    setRemovedListings([...removedListings, id]);
  }

  const activeListings = mockListings.filter(function (listing) {
    return !removedListings.includes(listing.id);
  });

  return (
    <div>

      <div className="page">
        <h2>Profile</h2>
        <div className="card">
          <div className="photo">Profile photo</div>
          <h3>{currentUser.name}</h3>
          <p>
            NYU student. Subletting my place while I'm away this summer.
          </p>
          <p className="muted">NYU | New York</p>

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
            <li><strong>NYU Email Verified</strong> (.edu)</li>
            <li><strong>Government ID Verified</strong></li>
            <li><strong>Phone Number Verified</strong></li>
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
                  {applications.map(function (app) {
                    return (
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
                    );
                  })}
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
                onClick={function () {
                  if (props.navigate) {
                    props.navigate("/post-sublet");
                  }
                }}
              >
                + Post a Sublet
              </button>
            </div>

            {activeListings.length > 0 ? (
              <div className="listings-grid">
                {activeListings.map(function (listing) {
                  return (
                    <div key={listing.id} className="listing-wrapper">
                      <ListingCard listing={listing} />
                      <button
                        className="remove-btn"
                        onClick={function () {
                          handleRemove(listing.id);
                        }}
                      >
                        Remove Listing
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted">No listings available.</p>
            )}

          <div className="card">
          <h3>My Reviews</h3>
          <p className="muted">{REVIEWS.length} review</p>

          {REVIEWS.map(function (review) {
            return <ReviewCard key={review.id} review={review} />;
          })}
        </div>

          </div>
        )}


        <div className="card">
          <h3>Account Settings</h3>
          <div className="settings-links">
            <button
              className="link-btn"
              onClick={function () {
                if (props.navigate) {
                  props.navigate("/edit-profile");
                }
              }}
            >
              Edit Profile Details
            </button>
            <button
              className="link-btn"
              onClick={function () {
                if (props.navigate) {
                  props.navigate("/verification");
                }
              }}
            >
              ID & Student Verification
            </button>
            <button
              className="link-btn"
              onClick={function () {
                if (props.navigate) {
                  props.navigate("/payment-methods");
                }
              }}
            >
              Payment Methods
            </button>
          </div>
        </div>

        <button className="logout-btn" onClick={props.onLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}