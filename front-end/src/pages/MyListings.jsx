import { useState } from 'react'
import ListingCard from '../components/ListingCard'
import './MyListings.css'

const MyListings = () => {
  const [listings, setListings] = useState([])

  const handleRemove = id => {
    if (window.confirm('Remove this listing?')) {
      setListings(listings.filter(listing => listing.id !== id))
    }
  }

  return (
    <main className="MyListings">
      <h1>My Listings</h1>

      {listings.length === 0 ? (
        <p>You haven't posted any sublets yet.</p>
      ) : (
        <div className="MyListings-grid">
          {listings.map(listing => (
            <div key={listing.id} className="MyListings-item">
              <ListingCard listing={listing} />
              <button
                type="button"
                className="MyListings-remove"
                onClick={() => handleRemove(listing.id)}>
                Remove listing
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default MyListings