import "./ListingCard.css";

function ListingCard({ listing, saved, onToggleSave }) {
    return (
        <div className="listing-card">
            <img src={listing.image} alt={listing.title} />

            <div className="listing-info">
                <h3>{listing.title}</h3>
                <p>{listing.location}</p>
                <p>Available: {listing.availability}</p>
                <p className="listing-price">{listing.price} / month</p>
            </div>

            <div className="listing-buttons">
                {onToggleSave && (
                    <button
                        className="save-button"
                        onClick={() => onToggleSave(listing.id)}
                    >
                        {saved ? "Saved" : "Save"}
                    </button>
                )}

                <button className="details-button">
                    View Details
                </button>
            </div>
        </div>
    );
}

export default ListingCard;