import { useState } from "react";
import Header from "../components/Header";
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
    text: "Nana was easy to communicate. The apartment was clean and move-in was smooth.",
  },
];

export default function Profile({ user = USER, onLogout }) {
  const [mode, setMode] = useState("sublessor");
  const [removedListings, setRemovedListings] = useState([]);

  const handleRemove = (id) => {
    setRemovedListings([...removedListings, id]);
  };

  const activeListings = mockListings.filter(
    (listing) => !removedListings.includes(listing.id)
  );

  return (
    <div>
      <Header onMenu={() => {}} />

      <div className="page">
        <h2>Profile</h2>

        {/* Profile Card */}
        <div>
            
          </div>

          <div className="photo">Profile photo</div>
          <h3>{user.name}</h3>
          <p>
            NYU student. Subletting my place while I'm away
            this summer.
          </p>
          <p className="muted">NYU | New York</p>

          <div>
              <button
                className={mode === "subtenant" ? "active" : ""}
                onClick={() => setMode("subtenant")}
              >
                Subtenant
              </button>
             
              <button
                className={mode === "sublessor" ? "active" : ""}
                onClick={() => setMode("sublessor")}
              >
                Sublessor
              </button>
            
            </div>

        </div>

        {mode === "sublessor" && (
          <div className="section">
            <h3>My Listings</h3>
            <button className="primary-btn">Post a Sublet</button>

            {activeListings.length > 0 ? (
              <div className="listings-grid" style={{ marginTop: "16px" }}>
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
          </div>
        )}

        {/* Reviews Section */}
        <div className="card">
          <h3>My Reviews</h3>
          <p className="muted">{REVIEWS.length} review</p>

          {REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

          <button className="logout-btn" onClick={onLogout}>
            Log Out
          </button>
     
      </div>
  );
}