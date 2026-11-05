
import { Link } from "react-router-dom";
import "./HotelDetails.css";

function HotelDetails({ hotel }) {
  return (
    <article className="result-hotel-card">
      <Link
        to={`/hotel/${hotel.id}`}
        className="result-hotel-image-link"
        aria-label={`View details for ${hotel.name}`}
      >
        <img
          src={hotel.image}
          alt={hotel.name}
          className="result-hotel-image"
        />
      </Link>

      <div className="result-hotel-info">
        <h3>{hotel.name}</h3>

        <p className="result-hotel-location">
          {hotel.location}
        </p>

        <p className="result-hotel-rating">
          ★ {hotel.rating} / 5
        </p>
      </div>
    </article>
  );
}

export default HotelDetails;
