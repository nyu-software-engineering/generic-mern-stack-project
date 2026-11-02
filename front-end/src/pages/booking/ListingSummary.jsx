import { getUser, listingImage } from '../../services/bookings'

// Small item header reused by the booking screens.
function ListingSummary({ listing, detail }) {
  const owner = getUser(listing.ownerId)
  return (
    <div className="booking-card booking-item">
      <img src={listingImage(listing.id)} alt={listing.title} />
      <div>
        <h2>{listing.title}</h2>
        <p>{detail ?? `${owner?.name} · $${listing.price}/day`}</p>
      </div>
    </div>
  )
}

export default ListingSummary
