import { useEffect, useState } from 'react'
import ListingCard from '../../components/ListingCard'
import { listingCategories } from '../../data/options.js'
import { searchListings } from '../../services/publicListings.js'
import { Link } from 'react-router-dom'
import './browse.css'

function Browse() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const searchText = search.trim()

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
            {listingCategories.map((name) => (
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

      <ListingResults
        key={JSON.stringify([searchText, category])}
        search={searchText}
        category={category === 'All' ? '' : category}
        onClear={resetFilters}
      />
    </main>
  )
}

function ListingResults({ search, category, onClear }) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const request = new AbortController()
    const { signal } = request
    const timer = setTimeout(() => {
      searchListings({ search, category, signal }).then(
        (listings) => { if (!signal.aborted) setResult({ listings }) },
        (error) => { if (!signal.aborted) setResult({ error: error.message }) },
      )
    }, search ? 200 : 0)
    return () => {
      request.abort()
      clearTimeout(timer)
    }
  }, [search, category, attempt])

  if (!result) return <p role="status">Loading listings...</p>

  if (result.error) {
    return (
      <section>
        <p role="alert">Could not load listings. {result.error}</p>
        <button type="button" onClick={() => {
          setResult(null)
          setAttempt((value) => value + 1)
        }}>Try again</button>
      </section>
    )
  }

  const { listings } = result
  return (
    <>
      <p aria-live="polite">{listings.length} items found</p>
      {listings.length > 0 ? (
        <div className="browse-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <section>
          <h2>No items found</h2>
          <p>Try another search or clear your filters.</p>
          <button type="button" onClick={onClear}>
            Show all items
          </button>
        </section>
      )}
    </>
  )
}

export default Browse
