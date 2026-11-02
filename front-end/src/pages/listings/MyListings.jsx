import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listingCategories, listingStatuses } from '../../data/options.js'
import {
  createListing,
  getListings,
  loadMockData,
  updateListing,
  updateListingStatus,
} from '../../services/mockDataService.js'

const emptyForm = {
  title: '',
  category: '',
  description: '',
  price: '',
  rentalTerms: '',
}

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function MyListings() {
  const [listings, setListings] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [previewId, setPreviewId] = useState(null)
  const [listingSearch, setListingSearch] = useState('')
  const [listingStatus, setListingStatus] = useState('all')

  useEffect(() => {
    let current = true
    loadMockData().then(
      () => { if (current) setListings(getListings()) },
      () => { if (current) setLoadError(true) },
    )
    return () => { current = false }
  }, [])

  if (loadError) {
    return <main className="page">
      <p role="alert">Could not load your listings.</p>
      <button type="button" className="primary-button" onClick={() => window.location.reload()}>Try again</button>
    </main>
  }
  if (!listings) return <main className="page"><p role="status">Loading listings...</p></main>

  const visibleListings = listings.filter((listing) => {
    const matchesStatus =
      listingStatus === 'all' || listing.status === listingStatus
    const searchText = `${listing.title} ${listing.category}`.toLowerCase()
    const matchesSearch = searchText.includes(listingSearch.trim().toLowerCase())

    return matchesStatus && matchesSearch
  })

  const previewListing = listings.find((listing) => listing.id === previewId)

  function startNewListing() {
    setEditingId(null)
    setForm(emptyForm)
    setPreviewId(null)
    setFormOpen(true)
  }

  function startEditing(listing) {
    setEditingId(listing.id)
    setForm({
      title: listing.title,
      category: listing.category,
      description: listing.description,
      price: String(listing.price),
      rentalTerms: listing.rentalTerms,
    })
    setPreviewId(null)
    setFormOpen(true)
  }

  function updateForm(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function saveListing(event) {
    event.preventDefault()

    const details = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      rentalTerms: form.rentalTerms.trim(),
    }

    if (
      !details.title ||
      !details.category ||
      !details.description ||
      !details.rentalTerms ||
      !Number.isFinite(details.price) ||
      details.price < 0
    ) {
      return
    }

    const savedListing =
      editingId === null
        ? createListing(details)
        : updateListing(editingId, details)

    if (!savedListing) return

    setListings(getListings())
    setFormOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setPreviewId(savedListing.id)
  }

  function publishListing(id) {
    updateListingStatus(id, 'published')
    setListings(getListings())
    setPreviewId(null)
  }

  function toggleListingStatus(listing) {
    const nextStatus = listing.status === 'published' ? 'paused' : 'published'
    updateListingStatus(listing.id, nextStatus)
    setListings(getListings())
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>My Listings</h1>
          <p>Manage your items and rental terms.</p>
          <Link to="/owner-dashboard">View rental activity</Link>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={startNewListing}
        >
          Add listing
        </button>
      </header>

      {formOpen && (
        <form className="listing-form" onSubmit={saveListing}>
          <h2>{editingId === null ? 'New listing' : 'Edit listing'}</h2>

          <label>
            Item name
            <input
              name="title"
              required
              value={form.title}
              onChange={updateForm}
            />
          </label>

          <label>
            Category
            <select
              name="category"
              required
              value={form.category}
              onChange={updateForm}
            >
              <option value="">Choose a category</option>
              {listingCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Description
            <textarea
              name="description"
              required
              rows="3"
              value={form.description}
              onChange={updateForm}
            />
          </label>

          <label>
            Price per day
            <input
              name="price"
              required
              min="0"
              step="0.01"
              type="number"
              value={form.price}
              onChange={updateForm}
            />
          </label>

          <label>
            Rental terms
            <textarea
              name="rentalTerms"
              required
              rows="3"
              value={form.rentalTerms}
              onChange={updateForm}
            />
          </label>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              Save and preview
            </button>
            <button type="button" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {previewListing && (
        <section className="preview-card">
          <h2>Listing preview</h2>
          {previewListing.image && <img className="listing-image" src={previewListing.image} alt={previewListing.title} />}
          <p>{previewListing.category}</p>
          <h3>{previewListing.title}</h3>
          <p>{previewListing.description}</p>
          <p>${previewListing.price.toFixed(2)} per day</p>
          <p>
            <strong>Rental terms:</strong> {previewListing.rentalTerms}
          </p>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => startEditing(previewListing)}
            >
              Edit
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => publishListing(previewListing.id)}
            >
              Publish listing
            </button>
            <button type="button" onClick={() => setPreviewId(null)}>
              Close preview
            </button>
          </div>
        </section>
      )}

      <section className="listings-section">
        <h2>My listings</h2>

        <div className="filters">
          <input
            aria-label="Search listings"
            placeholder="Search listings"
            value={listingSearch}
            onChange={(event) => setListingSearch(event.target.value)}
          />
          <select
            aria-label="Filter listings by status"
            value={listingStatus}
            onChange={(event) => setListingStatus(event.target.value)}
          >
            <option value="all">All</option>
            {listingStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        {visibleListings.length === 0 ? (
          <p>
            {listings.length === 0
              ? 'No listings yet. Add one to get started.'
              : 'No listings match your search.'}
          </p>
        ) : (
          <div className="listing-grid">
            {visibleListings.map((listing) => (
              <article className="listing-card" key={listing.id}>
                {listing.image && <img className="listing-image" src={listing.image} alt={listing.title} loading="lazy" />}
                <div>
                  <h3>{listing.title}</h3>
                  <p>{listing.category}</p>
                  <p>${listing.price.toFixed(2)} per day</p>
                  <span className={`status status-${listing.status}`}>
                    {formatStatus(listing.status)}
                  </span>
                </div>

                <div className="listing-actions">
                  <button type="button" onClick={() => startEditing(listing)}>
                    Edit
                  </button>
                  {listing.status === 'draft' ? (
                    <button
                      type="button"
                      onClick={() => setPreviewId(listing.id)}
                    >
                      Preview
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleListingStatus(listing)}
                    >
                      {listing.status === 'published' ? 'Pause' : 'Publish'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default MyListings
