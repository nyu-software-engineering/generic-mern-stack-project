import { Link } from 'react-router-dom'

function ListingCard({ listing }) {
  return (
    <article className="listing-card">
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