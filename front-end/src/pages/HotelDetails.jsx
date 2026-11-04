
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockHotels } from "../data/mockHotels";
import "./HotelDetails.css";

function HotelDetails() {
  const { id } = useParams();

  const hotel = mockHotels.find((item) => item.id === id);

  const [isSaved, setIsSaved] = useState(false);

  if (!hotel) {
    return (
      <main className="hotel-details">
        <h2>Hotel not found</h2>
        <Link to="/results">Back to Search Results</Link>
      </main>
    );
  }

  function handleSave() {
    setIsSaved((previous) => !previous);
  }

  return (
    <main className="hotel-details">
      <header className="hotel-details-header">
        <Link to="/results" className="hotel-back">
          ← Back
        </Link>
        <h1>Hotel Details</h1>
      </header>

      <img
        className="hotel-main-image"
        src={hotel.image}
        alt={`${hotel.name} hotel`}
      />

      <section className="hotel-information">
        <h2>{hotel.name}</h2>
        <p className="hotel-location">📍 {hotel.location}</p>
        <p className="hotel-rating">★ {hotel.rating} / 5</p>

        <h3>About this hotel</h3>
        <p className="hotel-description">
          {hotel.description}
        </p>

        <h3>Amenities</h3>
        <ul className="hotel-amenities">
          {hotel.amenities.map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
        </ul>

        <button
          className={`hotel-save-button ${isSaved ? "is-saved" : ""}`}
          onClick={handleSave}
          type="button"
          aria-pressed={isSaved}
        >
          {isSaved ? "✓ Saved — Click to Remove" : "♡ Save Hotel"}
        </button>
      </section>
    </main>
  );
}

export default HotelDetails;
