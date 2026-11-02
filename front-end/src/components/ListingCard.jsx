
import "./ListingCard.css";
import { useState } from "react";

function ListingCard({ listing }) {
    const [saved, setSaved] = useState(false);
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
            <button
                type="button"
                className="save-button"
                onClick={() => setSaved(!saved)}
                >
                {saved ? "Saved" : "Save"}
            </button>
            <button type="button" className="details-button">
            View Details
            </button>
        </div>
        </div>
    );
}

export default ListingCard;
