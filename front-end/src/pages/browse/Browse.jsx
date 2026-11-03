import { useState } from 'react'
import ListingCard from '../../components/ListingCard'
import { getPublishedListings } from '../../services/listings'
import { Link } from 'react-router-dom'
import './browse.css'

function Browse() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const listings = getPublishedListings()
  const categories = [...new Set(listings.map((listing) => listing.category))]

  const visibleListings = listings.filter((listing) => {
    const searchText =
      `${listing.title} ${listing.description}`.toLowerCase()

    const matchesSearch = searchText.includes(search.trim().toLowerCase())
    const matchesCategory =
      category === 'All' || listing.category === category

    return matchesSearch && matchesCategory
  })

  function resetFilters() {
    setSearch('')
    setCategory('All')
  }

  return (
    <main className="browse-page">
      <h1>Browse items</h1>
      <p>Find something to borrow or rent from another student.</p>
      <Link to="/renter-dashboard">My Rentals and saved items</Link>

      <div className="browse-filters">
        <label>
          Search items
          <input
            type="search"
            placeholder="Search by name or description"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="All">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={resetFilters}>
          Clear filters
        </button>
      </div>

      <p aria-live="polite">
        {visibleListings.length} items found
      </p>

      {visibleListings.length > 0 ? (
        <div className="browse-grid">
          {visibleListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <section>
          <h2>No items found</h2>
          <p>Try another search or clear your filters.</p>
          <button type="button" onClick={resetFilters}>
            Show all items
          </button>
        </section>
      )}
    </main>
  )
}

export default Browse