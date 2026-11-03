import { Link } from 'react-router-dom'
import { listingImage } from '../services/bookings'
import { useState } from 'react'
import { CURRENT_USER_ID } from '../services/mockDataService.js'
import {
  isListingSaved,
  saveListing,
  unsaveListing,
} from '../services/savedItems.js'

function ListingCard({ listing }) {
    const [saved, setSaved] = useState(() =>
    isListingSaved(CURRENT_USER_ID, listing.id),
  )

  function handleToggleSave() {
    if (isListingSaved(CURRENT_USER_ID, listing.id)) {
      unsaveListing(CURRENT_USER_ID, listing.id)
    } else {
      saveListing(CURRENT_USER_ID, listing.id)
    }

    setSaved(isListingSaved(CURRENT_USER_ID, listing.id))
  }
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
      {listing.ownerId !== CURRENT_USER_ID && (
        <button
          type="button"
          aria-pressed={saved}
          onClick={handleToggleSave}
        >
          {saved ? 'Unsave item' : 'Save item'}
        </button>
      )}
    </article>
  )
}

export default ListingCard