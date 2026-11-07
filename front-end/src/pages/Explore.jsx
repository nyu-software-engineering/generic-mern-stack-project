
import { useState } from "react";
import "./Explore.css";
import ListingCard from "../components/ListingCard";
import mockListings from "../mockListings";

function Explore({ savedIds, onToggleSave }) {
    const [location, setLocation] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [availableDate, setAvailableDate] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const filteredListings = mockListings.filter((listing) => {
        const matchesLocation = listing.location.toLowerCase().includes(location.toLowerCase().trim());
        const price = Number(listing.price.replace(/[$,]/g, ""));
        const matchesPrice = maxPrice === "" || price <= Number(maxPrice);
        const matchesDate = availableDate === "" || (listing.startDate <= availableDate && listing.endDate >= availableDate);

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

            <div className="explore-search">
                <div className="location-search">
                    <input
                        type="text"
                        placeholder="Search by location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />

                    {location !== "" && (
                        <button type="button" onClick={() => setLocation("")}>
                            ✕
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    className="filter-open"
                    onClick={() => setShowFilters(true)}
                >
                    ☷ Filters
                </button>
            </div>

            {(maxPrice !== "" || availableDate !== "") && (
                <div className="active-filters">
                    {maxPrice !== "" && (
                        <button type="button" onClick={() => setMaxPrice("")}>
                            Under ${maxPrice} ✕
                        </button>
                    )}

                    {availableDate !== "" && (
                        <button type="button" onClick={() => setAvailableDate("")}>
                            Available {availableDate} ✕
                        </button>
                    )}
                </div>
            )}

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
                <p>No listings match your search or filters.</p>
            )}

            {showFilters && (
                <div className="filter-overlay">
                    <div className="filter-panel">
                        <div className="filter-header">
                            <h3>Filters</h3>
                            <button type="button" onClick={() => setShowFilters(false)}>✕</button>
                        </div>

                        <label htmlFor="max-price">Maximum monthly rent</label>
                        <input
                            id="max-price"
                            type="number"
                            placeholder="Enter maximum budget"
                            min="0"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />

                        <label htmlFor="available-date">Available on</label>
                        <input
                            id="available-date"
                            type="date"
                            value={availableDate}
                            onChange={(e) => setAvailableDate(e.target.value)}
                        />

                        <div className="filter-actions">
                            <button type="button" className="clear-button" onClick={clearFilters}>
                                Clear all
                            </button>

                            <button type="button" className="apply-button" onClick={() => setShowFilters(false)}>
                                Show {filteredListings.length} listings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Explore;
