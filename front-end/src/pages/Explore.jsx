import "./Explore.css";
import { useState } from "react";
import ListingCard from "../components/ListingCard";
import mockListings from "../mockListings";

function Explore() {
    const [savedIds, setSavedIds] = useState([]);

    function toggleSave(id) {
        if (savedIds.includes(id)) {
            setSavedIds(savedIds.filter(savedId => savedId !== id));
        } else {
            setSavedIds([...savedIds, id]);
        }
    }

    return (
        <div className="explore-page">
            <h2>Find Your Next Sublet</h2>
            <p>{mockListings.length} listings</p>

            <div className="listings">
                {mockListings.map(listing => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        saved={savedIds.includes(listing.id)}
                        onToggleSave={toggleSave}
                    />
                ))}
            </div>
        </div>
    );
}

export default Explore;