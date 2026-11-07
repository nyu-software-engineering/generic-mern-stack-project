
import { useState } from "react";
import "./Explore.css";
import ListingCard from "../components/ListingCard";
import mockListings from "../mockListings";

function Explore({ savedIds, onToggleSave }) {
    const [location, setLocation] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [availableDate, setAvailableDate] = useState("");

    const filteredListings = mockListings.filter((listing) => {
        const matchesLocation = listing.location.toLowerCase().includes(location.toLowerCase());

        const price = Number(listing.price.replace(/[$,]/g, ""));

        const matchesPrice = maxPrice === "" || price <= Number(maxPrice);

        const matchesDate = availableDate === "" || (listing.startDate <= availableDate &&listing.endDate >= availableDate);

        return matchesLocation && matchesPrice && matchesDate;
    });

    function clearFilters() {
        setLocation("");
        setMaxPrice("");
        setAvailableDate("");
    }

    return (
        <div className="explore-page">
            <h2>Find Your Next Sublet</h2>

            <div className="explore-filters">
                <input
                    type="text"
                    placeholder="City, neighborhood, or address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Maximum monthly rent"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                />

                <label htmlFor="available-date">
                    Available on
                </label>
                <input
                    id="available-date"
                    type="date"
                    value={availableDate}
                    onChange={(e) => setAvailableDate(e.target.value)}
                />

                <button type="button" onClick={clearFilters}>
                    Clear filters
                </button>
            </div>

            <p>{filteredListings.length} listings</p>

            <div className="listings">
                {filteredListings.map((listing) => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        saved={savedIds.includes(listing.id)}
                        onToggleSave={onToggleSave}
                    />
                ))}
            </div>

            {filteredListings.length === 0 && (
                <p>No listings match your filters.</p>
            )}
        </div>
    );
}

export default Explore;
