import "./Explore.css";
import ListingCard from "../components/ListingCard";
import mockListings from "../mockListings";
import Header from "../components/Header";

function Explore({ savedIds, onToggleSave }) {
    return (
        <div>
            <Header onMenu={() => {}} />
        <div className="explore-page">
            <h2>Find Your Next Sublet</h2>
            <p>{mockListings.length} listings</p>

            <div className="listings">
                {mockListings.map(listing => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        saved={savedIds.includes(listing.id)}
                        onToggleSave={onToggleSave}
                    />
                ))}
            </div>
        </div>
    </div>
    );
}

export default Explore;