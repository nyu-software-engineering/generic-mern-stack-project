import { useEffect, useState } from 'react'
import ListingCard from '../../components/ListingCard'
import { SavedItemsStatus } from '../../components/SaveListingButton.jsx'
import { listingCategories } from '../../data/options.js'
import { searchListings } from '../../services/publicListings.js'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
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
    <main className="ds-page ds-discovery">
      <header className="ds-discovery-header">
        <div>
          <h1 className="ds-heading">Browse items</h1>
          <p className="ds-page-intro">Borrow, lend and rent within NYU.</p>
        </div>
        <Link className="ds-text-link" to="/renter-dashboard">
          <Icon name="rentals" />
          My Rentals and saved items
        </Link>
      </header>

      <div className="ds-discovery-filters">
        <label className="ds-search-field">
          Search items
          <span className="ds-search-input">
            <Icon name="search" />
            <input
              className="ds-field"
              type="search"
              placeholder="Search by name or description"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </label>

        <label>
          Category
          <select
            className="ds-field"
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

        <button className="ds-button ds-button--secondary" type="button" onClick={resetFilters}>
          Clear filters
        </button>
      </div>

      <SavedItemsStatus />
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

  if (!result) return (
    <section aria-busy="true">
      <p className="ds-status" role="status">Loading listings...</p>
      <div className="ds-catalog-skeleton" aria-hidden="true">
        {[0, 1, 2].map((item) => <div className="ds-skeleton-item" key={item}><span /><span /><span /></div>)}
      </div>
    </section>
  )

  if (result.error) {
    return (
      <section className="ds-feedback ds-feedback--error">
        <p role="alert">Could not load listings. {result.error}</p>
        <button className="ds-button ds-button--secondary" type="button" onClick={() => {
          setResult(null)
          setAttempt((value) => value + 1)
        }}>Try again</button>
      </section>
    )
  }

  const { listings } = result
  return (
    <>
      <p className="ds-result-count" aria-live="polite">{listings.length} {listings.length === 1 ? 'item' : 'items'} found</p>
      {listings.length > 0 ? (
        <div className="ds-catalog-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <section className="ds-feedback ds-empty-state">
          <Icon name="search" size={28} />
          <h2>No items found</h2>
          <p>Try another search or clear your filters.</p>
          <button className="ds-button ds-button--primary" type="button" onClick={onClear}>
            Show all items
          </button>
        </section>
      )}
    </>
  )
}

export default Browse
