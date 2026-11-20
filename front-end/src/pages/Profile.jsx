import {useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import "./Profile.css";

function Profile() {    
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [stays, setStays] = useState([]);
    const [selectedYear, setSelectedYear] = useState("All");

    useEffect(() => {
        fetch("/api/auth/me", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => setUser(data.user))
        .catch(() => navigate("/signin")); 
         fetch("/api/profile/stays", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setStays(data));
    }, []);

    async function handleSignOut() {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        navigate("/signin", { replace: true });
    }
    
    const years = [...new Set(stays.map((stay) => stay.date.slice(0, 4)))]
        .sort((a, b) => b - a);
    
   
    const visibleStays = stays
        .filter((stay) => selectedYear === "All" || stay.date.startsWith(selectedYear))
        .sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="profile">
            <header className="profile-header">
                <h2>Profile</h2>
                <p>Email: {user?.email}</p>
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
                    {selectedYear === "All" ? "Total hotel stays" : `Stays in ${selectedYear}`}: {visibleStays.length}
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
                <button className="sign-out" onClick={handleSignOut }>Sign Out</button>
            </div>
        </div>
    );
}

export default Profile;