import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listingCategories, listingStatuses } from '../../data/options.js'
import { listingImage } from '../../services/bookings.js'
import { createListing, getMyListings, updateListing, updateListingStatus } from '../../services/listings.js'
import { validateListingForm } from './listingForm.js'
import Icon from '../../components/Icon.jsx'
import '../../styles/management.css'
import './listings.css'

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

function MyListings({ initialFormOpen = false }) {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [pending, setPending] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const mutationPending = useRef(false)
  const [formOpen, setFormOpen] = useState(initialFormOpen)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [previewId, setPreviewId] = useState(null)
  const [listingSearch, setListingSearch] = useState('')
  const [listingStatus, setListingStatus] = useState('all')

  useEffect(() => {
    let current = true
    getMyListings().then(
      (result) => {
        if (!current) return
        setListings(result)
        setLoading(false)
      },
      (error) => {
        if (!current) return
        setLoadError(error.message)
        setLoading(false)
      },
    )
    return () => { current = false }
  }, [loadAttempt])

  const disabled = pending || loading || Boolean(loadError)

  const visibleListings = listings.filter((listing) => {
    const matchesStatus =
      listingStatus === 'all' || listing.status === listingStatus
    const searchText = `${listing.title} ${listing.category}`.toLowerCase()
    const matchesSearch = searchText.includes(listingSearch.trim().toLowerCase())

    return matchesStatus && matchesSearch
  })

  const previewListing = listings.find((listing) => listing.id === previewId)

  function startNewListing() {
    setFieldErrors({})
    setSaveError('')
    setEditingId(null)
    setForm(emptyForm)
    setPreviewId(null)
    setFormOpen(true)
  }

  function startEditing(listing) {
    setFieldErrors({})
    setSaveError('')
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
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function saveListing(event) {
    event.preventDefault()
    if (mutationPending.current || loading || loadError) return

    const errors = validateListingForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      event.currentTarget.elements.namedItem(Object.keys(errors)[0])?.focus()
      return
    }

    const details = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      rentalTerms: form.rentalTerms.trim(),
    }

    mutationPending.current = true
    setPending(true)
    setSaveError('')
    try {
      const savedListing = editingId === null
        ? await createListing(details)
        : await updateListing(editingId, details)
      setListings((current) => editingId === null
        ? [savedListing, ...current]
        : current.map((listing) => listing.id === savedListing.id ? savedListing : listing))
      setFormOpen(false)
      setEditingId(null)
      setForm(emptyForm)
      setFieldErrors({})
      setPreviewId(savedListing.id)
    } catch (error) {
      setSaveError(error.message)
    } finally {
      mutationPending.current = false
      setPending(false)
    }
  }

  async function changeListingStatus(id, status) {
    if (mutationPending.current || loading || loadError) return
    mutationPending.current = true
    setPending(true)
    setSaveError('')
    try {
      const savedListing = await updateListingStatus(id, status)
      setListings((current) => current.map((listing) => listing.id === savedListing.id ? savedListing : listing))
      if (previewId === id) setPreviewId(null)
    } catch (error) {
      setSaveError(error.message)
    } finally {
      mutationPending.current = false
      setPending(false)
    }
  }

  function toggleListingStatus(listing) {
    const nextStatus = listing.status === 'published' ? 'paused' : 'published'
    changeListingStatus(listing.id, nextStatus)
  }

  function closeForm() {
    setFieldErrors({})
    setSaveError('')
    setFormOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    navigate('/listings')
  }

  return (
    <main className="ds-page ds-management">
      <header className="ds-management-header">
        <div>
          <h1 className="ds-heading">My Listings</h1>
          <p className="ds-page-intro">Manage your items and rental terms.</p>
          <Link className="ds-text-link" to="/owner-dashboard">View rental activity</Link>
        </div>
        <button
          className="ds-button ds-button--primary"
          type="button"
          onClick={startNewListing}
          disabled={disabled}
        >
          <Icon name="plus" />Add listing
        </button>
      </header>

      {loading && <p className="ds-status" role="status">Loading your listings...</p>}
      {loadError && (
        <div className="ds-feedback ds-feedback--error" role="alert">
          <p>{loadError}</p>
          <button className="ds-button ds-button--secondary" type="button" onClick={() => {
            setLoadError('')
            setLoading(true)
            setLoadAttempt((attempt) => attempt + 1)
          }}>Try again</button>
        </div>
      )}
      {saveError && <p className="ds-feedback ds-feedback--error" role="alert">{saveError}</p>}
      {pending && !formOpen && <p className="ds-status" role="status">Updating listing...</p>}

      {formOpen && (
        <form className="ds-listing-form" onSubmit={saveListing} aria-busy={pending}>
          <h2>{editingId === null ? 'New listing' : 'Edit listing'}</h2>

          <label>
            <span id="listing-title-label">Item name</span>
            <input
              className="ds-field"
              name="title"
              aria-labelledby="listing-title-label"
              aria-invalid={Boolean(fieldErrors.title) || undefined}
              aria-describedby={fieldErrors.title ? 'listing-title-error' : undefined}
              disabled={disabled}
              required
              value={form.title}
              onChange={updateForm}
            />
            {fieldErrors.title && <span className="ds-listing-field-error" id="listing-title-error" role="alert">{fieldErrors.title}</span>}
          </label>

          <label>
            <span id="listing-category-label">Category</span>
            <select
              className="ds-field"
              name="category"
              aria-labelledby="listing-category-label"
              aria-invalid={Boolean(fieldErrors.category) || undefined}
              aria-describedby={fieldErrors.category ? 'listing-category-error' : undefined}
              disabled={disabled}
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
            {fieldErrors.category && <span className="ds-listing-field-error" id="listing-category-error" role="alert">{fieldErrors.category}</span>}
          </label>

          <label>
            <span id="listing-description-label">Description</span>
            <textarea
              className="ds-field"
              name="description"
              aria-labelledby="listing-description-label"
              aria-invalid={Boolean(fieldErrors.description) || undefined}
              aria-describedby={fieldErrors.description ? 'listing-description-error' : undefined}
              disabled={disabled}
              required
              rows="3"
              value={form.description}
              onChange={updateForm}
            />
            {fieldErrors.description && <span className="ds-listing-field-error" id="listing-description-error" role="alert">{fieldErrors.description}</span>}
          </label>

          <label>
            <span id="listing-price-label">Price per day</span>
            <input
              className="ds-field"
              name="price"
              aria-labelledby="listing-price-label"
              aria-invalid={Boolean(fieldErrors.price) || undefined}
              aria-describedby={fieldErrors.price ? 'listing-price-error' : undefined}
              disabled={disabled}
              required
              min="0"
              step="0.01"
              type="number"
              value={form.price}
              onChange={updateForm}
            />
            {fieldErrors.price && <span className="ds-listing-field-error" id="listing-price-error" role="alert">{fieldErrors.price}</span>}
          </label>

          <label>
            <span id="listing-rentalTerms-label">Rental terms</span>
            <textarea
              className="ds-field"
              name="rentalTerms"
              aria-labelledby="listing-rentalTerms-label"
              aria-invalid={Boolean(fieldErrors.rentalTerms) || undefined}
              aria-describedby={fieldErrors.rentalTerms ? 'listing-terms-error' : undefined}
              disabled={disabled}
              required
              rows="3"
              value={form.rentalTerms}
              onChange={updateForm}
            />
            {fieldErrors.rentalTerms && <span className="ds-listing-field-error" id="listing-terms-error" role="alert">{fieldErrors.rentalTerms}</span>}
          </label>

          <div className="ds-management-actions">
            <button className="ds-button ds-button--primary" type="submit" disabled={disabled}>
              {pending ? 'Saving...' : 'Save and preview'}
            </button>
            <button className="ds-button ds-button--secondary" type="button" onClick={closeForm} disabled={pending}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {previewListing && (
        <section className="ds-listing-preview" aria-labelledby="listing-preview-heading">
          <div className="ds-listing-preview-heading">
            <h2 id="listing-preview-heading">Listing preview</h2>
            <span className={`ds-listing-status ds-listing-status--${previewListing.status}`}>{formatStatus(previewListing.status)}</span>
          </div>
          <img className="ds-listing-thumbnail" src={listingImage(previewListing.id)} alt={previewListing.title} />
          <p>{previewListing.category}</p>
          <h3>{previewListing.title}</h3>
          <p>{previewListing.description}</p>
          <p>${previewListing.price.toFixed(2)} per day</p>
          <p>
            <strong>Rental terms:</strong> {previewListing.rentalTerms}
          </p>
          <div className="ds-management-actions">
            <button
              className="ds-button ds-button--secondary"
              type="button"
              onClick={() => startEditing(previewListing)}
              disabled={disabled}
            >
              Edit
            </button>
            <button
              className="ds-button ds-button--primary"
              type="button"
              onClick={() => changeListingStatus(previewListing.id, 'published')}
              disabled={disabled}
            >
              Publish listing
            </button>
            <button className="ds-button ds-button--secondary" type="button" onClick={() => setPreviewId(null)} disabled={pending}>
              Close preview
            </button>
          </div>
        </section>
      )}

      {!loading && !loadError && <section className="ds-management-section">
        <h2>My listings</h2>

        <div className="ds-management-filters">
          <label>
            Search listings
            <input
              className="ds-field"
              placeholder="Search listings"
              value={listingSearch}
              onChange={(event) => setListingSearch(event.target.value)}
            />
          </label>
          <label>
            Listing status
            <select
              className="ds-field"
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
          </label>
        </div>

        {visibleListings.length === 0 ? (
          <div className="ds-feedback ds-management-empty">
            <h3>{listings.length === 0 ? 'Your listings start here' : 'No matching listings'}</h3>
            <p>
              {listings.length === 0
                ? 'No listings yet. Add one to get started.'
                : 'No listings match your search.'}
            </p>
          </div>
        ) : (
          <div className="ds-management-list">
            {visibleListings.map((listing) => (
              <article className="ds-listing-row" key={listing.id}>
                <img className="ds-listing-thumbnail" src={listingImage(listing.id)} alt={listing.title} loading="lazy" />
                <div>
                  <h3>{listing.title}</h3>
                  <p>{listing.category}</p>
                  <p>${listing.price.toFixed(2)} per day</p>
                  <span className={`ds-listing-status ds-listing-status--${listing.status}`}>
                    {formatStatus(listing.status)}
                  </span>
                </div>

                <div className="ds-management-actions">
                  <button className="ds-button ds-button--secondary" type="button" onClick={() => startEditing(listing)} disabled={disabled}>
                    Edit
                  </button>
                  {listing.status === 'draft' ? (
                    <button
                      className="ds-button ds-button--secondary"
                      type="button"
                      onClick={() => setPreviewId(listing.id)}
                      disabled={disabled}
                    >
                      Preview
                    </button>
                  ) : (
                    <button
                      className="ds-button ds-button--secondary"
                      type="button"
                      onClick={() => toggleListingStatus(listing)}
                      disabled={disabled}
                    >
                      {listing.status === 'published' ? 'Pause' : 'Publish'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>}
    </main>
  )
}

export default MyListings
