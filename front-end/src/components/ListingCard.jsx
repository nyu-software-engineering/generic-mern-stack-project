import { Link } from 'react-router-dom'
import { listingImage } from '../services/bookings'

function ListingCard({ listing }) {
  return (
    <article className="listing-card">
      <img
        src={listingImage(listing.id, 320)}
        alt={listing.title}
        width={240}
        height={240}
        loading="lazy"
      />
      <p>{listing.category}</p>
      <h2>
        <Link to={`/browse/${listing.id}`}>
          {listing.title}
        </Link>
      </h2>
      <p>{listing.description}</p>
      <p>${listing.price.toFixed(2)} / day</p>
    </article>
  )
}

export default ListingCard