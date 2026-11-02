import "./Explore.css";
import ListingCard from "../components/ListingCard";
import mockListings from "../mockListings";

function Explore() {
    return (
        <div className="explore-page">
            <h2>Find Your Next Sublet</h2>

            <p>{mockListings.length} listings</p>

            <div className="listings">
            {mockListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
            ))}
            </div>
        </div>

    );
}

export default Explore;