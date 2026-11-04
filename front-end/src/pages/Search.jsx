import { useState } from 'react'
import { useSearchParams } from 'react-router'
import categories from '../categories.json'
import Header from './Header'
import ServiceCard from './ServiceCard'
import './Search.css'

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest listings' },
]

const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '3', label: '3 / 5 or higher' },
  { value: '4', label: '4 / 5 or higher' },
  { value: '4.5', label: '4.5 / 5 or higher' },
]

const EMPTY_FILTERS = { category: '', minPrice: '', maxPrice: '', minRating: '' }

function matchesKeyword(service, keyword) {
  const searchableText = `${service.title} ${service.provider} ${service.category}`.toLowerCase()
  return searchableText.includes(keyword.trim().toLowerCase())
}

function matchesFilters(service, filters) {
  if (filters.category && service.category !== filters.category) return false
  if (filters.minPrice && service.price < Number(filters.minPrice)) return false
  if (filters.maxPrice && service.price > Number(filters.maxPrice)) return false
  if (filters.minRating && (service.rating === null || service.rating < Number(filters.minRating))) return false
  return true
}

function compareServices(sort) {
  if (sort === 'price-low') return (a, b) => a.price - b.price
  if (sort === 'price-high') return (a, b) => b.price - a.price
  if (sort === 'rating') return (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
  if (sort === 'newest') return (a, b) => b.id - a.id
  return () => 0
}

function describeFilters(filters) {
  const descriptions = []
  if (filters.category) descriptions.push(filters.category)
  if (filters.minPrice) descriptions.push(`From $${filters.minPrice}`)
  if (filters.maxPrice) descriptions.push(`Up to $${filters.maxPrice}`)
  if (filters.minRating) descriptions.push(`${filters.minRating} / 5`)
  return descriptions.join(' · ')
}

export default function Search({ services }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [openMenu, setOpenMenu] = useState(null)
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS)
  const [draftSort, setDraftSort] = useState('recommended')

  const keyword = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') ?? 'recommended'
  const filters = {
    category: searchParams.get('category') ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    minRating: searchParams.get('minRating') ?? '',
  }

  const results = services
    .filter(service => service.status !== 'Paused')
    .filter(service => matchesKeyword(service, keyword) && matchesFilters(service, filters))
    .sort(compareServices(sort))

  function updateSearchParams(changes) {
    setSearchParams(currentParams => {
      const nextParams = new URLSearchParams(currentParams)
      Object.entries(changes).forEach(([key, value]) => {
        if (value) nextParams.set(key, value)
        else nextParams.delete(key)
      })
      return nextParams
    }, { replace: true })
  }

  function openFilters() {
    setDraftFilters(filters)
    setOpenMenu('filters')
  }

  function openSort() {
    setDraftSort(sort)
    setOpenMenu('sort')
  }

  function applyFilters() {
    updateSearchParams(draftFilters)
    setOpenMenu(null)
  }

  function applySort() {
    updateSearchParams({ sort: draftSort === 'recommended' ? '' : draftSort })
    setOpenMenu(null)
  }

  const resultsLabel = `${results.length} ${results.length === 1 ? 'result' : 'results'}${keyword.trim() ? ` for ${keyword.trim()}` : ''} · NYU`
  const selectedSortLabel = SORT_OPTIONS.find(option => option.value === draftSort).label

  return (
    <div className='search'>
      <Header />
      <section>
        <h1>
          All services
        </h1>

        <form role='search' onSubmit={event => event.preventDefault()}>
          <label className='search-field'>
            <strong>
              Search services
            </strong>
            <input
              type='search'
              value={keyword}
              placeholder='Look up services...'
              onChange={event => updateSearchParams({ q: event.target.value })}
            />
          </label>

          <div className='search-actions'>
            <button type='submit'>
              Search
            </button>
            <button type='button' onClick={openFilters}>
              Filter
            </button>
            <button type='button' onClick={openSort}>
              Sort
            </button>
          </div>
        </form>

        <p className='search-summary' aria-live='polite'>
          {resultsLabel}
        </p>

        {results.map(service => (
          <ServiceCard key={service.id} details={service} />
        ))}

        {results.length === 0 && (
          <>
            <div className='search-empty'>
              <h2>
                No matching services
              </h2>
              <p>
                Try a different keyword or remove your filters to see more student services.
              </p>
              {describeFilters(filters) && (
                <p className='search-empty-filters'>
                  {describeFilters(filters)}
                </p>
              )}
            </div>
            <button type='button' className='search-wide-button' onClick={() => updateSearchParams(EMPTY_FILTERS)}>
              Clear filters
            </button>
            <button type='button' className='search-wide-button' onClick={() => setSearchParams({}, { replace: true })}>
              Browse all services
            </button>
          </>
        )}
      </section>

      {openMenu === 'filters' && (
        <div className='search-backdrop'>
          <div className='search-modal' role='dialog' aria-modal='true' aria-labelledby='filter-title'>
            <h2 id='filter-title'>
              Filter services
            </h2>

            <div className='search-field'>
              <strong>
                Category
              </strong>
              <span>
                {draftFilters.category || 'All categories'}
              </span>
            </div>
            <div className='search-modal-row'>
              <button type='button' onClick={() => setDraftFilters({ ...draftFilters, category: '' })}>
                All categories
              </button>
              <button type='button' onClick={() => setOpenMenu('categories')}>
                Choose category
              </button>
            </div>

            <label className='search-field'>
              <strong>
                Minimum price
              </strong>
              <input
                type='number'
                min='0'
                inputMode='numeric'
                placeholder='$0'
                value={draftFilters.minPrice}
                onChange={event => setDraftFilters({ ...draftFilters, minPrice: event.target.value })}
              />
            </label>

            <label className='search-field'>
              <strong>
                Maximum price
              </strong>
              <input
                type='number'
                min='0'
                inputMode='numeric'
                placeholder='No limit'
                value={draftFilters.maxPrice}
                onChange={event => setDraftFilters({ ...draftFilters, maxPrice: event.target.value })}
              />
            </label>

            <label className='search-field'>
              <strong>
                Minimum rating
              </strong>
              <select
                value={draftFilters.minRating}
                onChange={event => setDraftFilters({ ...draftFilters, minRating: event.target.value })}
              >
                {RATING_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <p>
              University: NYU
            </p>

            <button type='button' className='search-wide-button' onClick={applyFilters}>
              Apply filters
            </button>
            <button type='button' className='search-wide-button' onClick={() => setDraftFilters(EMPTY_FILTERS)}>
              Reset filters
            </button>
            <button type='button' className='search-wide-button' onClick={() => setOpenMenu(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {openMenu === 'categories' && (
        <div className='search-backdrop'>
          <div className='search-modal' role='dialog' aria-modal='true' aria-labelledby='category-title'>
            <h2 id='category-title'>
              Choose a category
            </h2>
            <p>
              {draftFilters.category || 'All categories'} selected
            </p>

            {['', ...categories].map(category => (
              <button
                type='button'
                key={category || 'all'}
                className='search-wide-button'
                aria-pressed={draftFilters.category === category}
                onClick={() => setDraftFilters({ ...draftFilters, category })}
              >
                {category || 'All categories'}
              </button>
            ))}

            <button type='button' className='search-wide-button' onClick={() => setOpenMenu('filters')}>
              Done
            </button>
          </div>
        </div>
      )}

      {openMenu === 'sort' && (
        <div className='search-backdrop'>
          <div className='search-modal' role='dialog' aria-modal='true' aria-labelledby='sort-title'>
            <h2 id='sort-title'>
              Sort services
            </h2>

            <div className='search-field'>
              <strong>
                Selected sort
              </strong>
              <span>
                {selectedSortLabel}
              </span>
            </div>

            {SORT_OPTIONS.map(option => (
              <button
                type='button'
                key={option.value}
                className='search-wide-button'
                aria-pressed={draftSort === option.value}
                onClick={() => setDraftSort(option.value)}
              >
                {option.label}{draftSort === option.value && ' · Selected'}
              </button>
            ))}

            <button type='button' className='search-wide-button' onClick={applySort}>
              Apply sort
            </button>
            <button type='button' className='search-wide-button' onClick={() => setOpenMenu(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
