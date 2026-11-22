import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [username] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
  });
  const [stays] = useState([
    {
      id: 1,
      hotel: "Waldorf Astoria DC",
      city: "Washington D.C., USA",
      date: "2026-10-15",
    },
    {
      id: 2,
      hotel: "Ritz Carlton Half Moon Bay",
      city: "Half Moon Bay, USA",
      date: "2024-02-20",
    },
    {
      id: 3,
      hotel: "Park Hyatt Tokyo",
      city: "Tokyo, Japan",
      date: "2025-03-10",
    },
  ]);
  const [selectedYear, setSelectedYear] = useState("All");

  const years = [...new Set(stays.map((stay) => stay.date.slice(0, 4)))].sort(
    (a, b) => b - a,
  );

  const visibleStays = stays
    .filter(
      (stay) => selectedYear === "All" || stay.date.startsWith(selectedYear),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="profile">
      <header className="profile-header">
        <h2>Profile</h2>
        <p>Name: {username.name}</p>
        <p>Email: {username.email}</p>
      </header>
      <div className="profile-statistics">
        <h3>Statistics</h3>

        {/* Swipeable year selector */}
        <div className="year-slider">
          {["All", ...years].map((year) => (
            <button
              key={year}
              className={`year-button ${selectedYear === year ? "active" : ""}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <p>
          {selectedYear === "All"
            ? "Total hotel stays"
            : `Stays in ${selectedYear}`}
          : {visibleStays.length}
        </p>

        {visibleStays.length > 0 ? (
          <ul>
            {visibleStays.map((stay) => (
              <li key={stay.id}>
                {stay.hotel} - {stay.city} ({stay.date})
              </li>
            ))}
          </ul>
        ) : (
          <p>No stays found.</p>
        )}
      </div>

      <div className="profile-actions">
        <button onClick={() => navigate("/saved")}>View Saved Items</button>
        <button className="sign-out" onClick={() => navigate("/signin")}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Profile;
