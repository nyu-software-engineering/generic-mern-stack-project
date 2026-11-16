import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import TextField from '../components/TextField'
import { getPlaceDetail, updatePlaceDetails } from '../data/mockDataLayer'
import BackLink from '../components/BackLink'
import { getConfig } from '../api/config'
import { useApi } from '../hooks/useApi'
import { LoadingState, ErrorState } from '../components/LoadState'

// Each check returns an error message, or '' when the value is fine
function validateName(name) {
  if (!name.trim()) return 'Enter the name of the place.'
  if (name.trim().length > 80) return 'Keep the name under 80 characters.'
  return ''
}

function validateLocation(location) {
  if (!location.trim()) return 'Enter where the place is, like a neighborhood.'
  if (location.trim().length > 80) return 'Keep the location under 80 characters.'
  return ''
}

function validateCategory(categoryId, categories) {
  if (!categories.some((category) => category.id === categoryId)) return 'Pick a category.'
  return ''
}

export default function EditPlace() {
  const { placeId } = useParams()
  const navigate = useNavigate()
  const place = useMemo(() => getPlaceDetail(placeId), [placeId])
  // Categories come from the server (GET /api/config), not demoData
  const config = useApi(getConfig)

  // The form starts out filled with what we already know about the place
  const [name, setName] = useState(place?.name ?? '')
  const [categoryId, setCategoryId] = useState(place?.categoryId ?? '')
  const [location, setLocation] = useState(place?.neighborhood ?? '')
  const [touched, setTouched] = useState({ name: false, category: false, location: false })
  // An error that comes from saving, not from a single field
  const [formError, setFormError] = useState('')

  if (!place) {
    return (
      <section className="px-5 py-10 text-center">
        <h1 className="text-2xl font-semibold">Place not found</h1>
        <p className="mt-2 text-sm text-muted">There is nothing to edit here.</p>
        <BackLink to="/" label="Back to your lists" className="mb-6" />
      </section>
    )
  }

  if (config.loading) return <LoadingState message="Loading categories…" />
  if (config.error) return <ErrorState message={config.error.message} onRetry={config.retry} />

  const categories = config.data.categories

  const nameError = touched.name ? validateName(name) : ''
  const categoryError = touched.category ? validateCategory(categoryId, categories) : ''
  const locationError = touched.location ? validateLocation(location) : ''

  function handleSubmit(event) {
    event.preventDefault()
    // Show every error at once, even for fields the user never clicked into
    setTouched({ name: true, category: true, location: true })
    if (validateName(name) || validateCategory(categoryId, categories) || validateLocation(location)) return
    const result = updatePlaceDetails(place.id, { name, categoryId, neighborhood: location })
    if (!result.ok) {
      setFormError(result.error)
      return
    }
    // Saving takes the user back to the place they were looking at
    navigate(`/place/${place.id}`)
  }

  return (
    <section className="px-5 py-6">
      <Link
        to={`/place/${place.id}`}
        className="text-sm font-semibold text-muted hover:text-ink"
      >
        <span aria-hidden="true">←</span> Back
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Correct this place</h1>
      <p className="mt-1 text-sm text-muted">Fix anything we got wrong. Your friends will see the update.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <TextField
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          error={nameError}
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-900">Category</span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, category: true }))}
            aria-invalid={Boolean(categoryError)}
            className="input-field min-h-11 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          {categoryError && <span className="text-xs text-red-600">{categoryError}</span>}
        </label>

        <TextField
          label="Location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, location: true }))}
          error={locationError}
          hint="A neighborhood or area, like East Village."
        />

        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="mt-2 min-h-11 btn-primary hover:btn-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          Save changes
        </button>
      </form>
    </section>
  )
}
