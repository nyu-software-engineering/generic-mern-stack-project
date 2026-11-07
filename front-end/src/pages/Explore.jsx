
import { useState } from "react";
import "./Explore.css";
import ListingCard from "../components/ListingCard";
import mockListings from "../mockListings";

function Explore({ savedIds, onToggleSave }) {
    const [location, setLocation] = useState("");
    const [searchedLocation, setSearchedLocation] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [availableDate, setAvailableDate] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const filteredListings = mockListings.filter((listing) => {
        const matchesLocation = listing.location.toLowerCase().includes(searchedLocation.toLowerCase());
        const price = Number(listing.price.replace(/[$,]/g, ""));
        const matchesPrice = maxPrice === "" || price <= Number(maxPrice);
        const matchesDate = availableDate === "" || (listing.startDate <= availableDate && listing.endDate >= availableDate);

        return matchesLocation && matchesPrice && matchesDate;
    });

    function searchListings(e) {
        e.preventDefault();
        setSearchedLocation(location.trim());
    }

    function clearFilters() {
        setLocation("");
        setSearchedLocation("");
        setMaxPrice("");
        setAvailableDate("");
    }

    return (
        <div className="explore-page">
            <h2>Find Your Next Sublet</h2>

            <form className="explore-search" onSubmit={searchListings}>
                <input
                    type="text"
                    placeholder="Search by location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <button type="submit" className="search-button">
                    Search
                </button>

                <button
                    type="button"
                    className="filter-open"
                    onClick={() => setShowFilters(true)}
                >
                    Filters
                </button>
            </form>

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
