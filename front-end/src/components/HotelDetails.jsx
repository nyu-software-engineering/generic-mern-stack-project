import "./HotelDetails.css";

function HotelDetails() {
  return (
    <article className="hotel-details">
      <img
        src="https://picsum.photos/340/180"
        alt="Hotel"
        className="hotel-details-image"
      />

      <p className="hotel-details-info">
        brief info
      </p>
    </article>
  );
}

export default HotelDetails;