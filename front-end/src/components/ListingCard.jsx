
import "./ListingCard.css";

function ListingCard({ listing }) {
  return (
    <div className="listing-card">
      <img src={listing.image} alt={listing.title} />

      <div className="listing-info">
        <h3>{listing.title}</h3>
        <p>{listing.location}</p>
        <p>{listing.price} / month</p>
        <p>{listing.roommates} roommates</p>
      </div>
    </div>
  );
}

export default ListingCard;
