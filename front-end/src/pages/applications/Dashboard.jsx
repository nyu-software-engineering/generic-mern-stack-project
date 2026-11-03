import { api } from '../../api'
import { ApplicationCard, Button, EmptyState, ErrorState, FilterChips, IconButton, LoadingState, OptionSheet, Page, SearchBar } from '../../components'
import { APPLICATION_STATUSES, getLabel, SORT_OPTIONS } from '../../constants'
import { useApi } from '../../hooks/useApi'
import { useState } from 'react'
import './Dashboard.css'

// "All" plus one chip per status, using the short labels (e.g. "OA")
const STATUS_FILTERS = [{ value: 'all', label: 'All' }, ...APPLICATION_STATUSES.map((status) => ({ value: status.value, label: status.shortLabel }))]


// Statuses in pipeline order, used when sorting by status
const STATUS_ORDER = APPLICATION_STATUSES.map((status) => status.value)

// Return a sorted copy of the list for the chosen sort option
function sortApplications(list, sortBy) {
  const sorted = [...list]
  if (sortBy === 'newest') sorted.sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))
  if (sortBy === 'oldest') sorted.sort((a, b) => a.dateApplied.localeCompare(b.dateApplied))
  if (sortBy === 'company') sorted.sort((a, b) => a.company.localeCompare(b.company))
  if (sortBy === 'status') sorted.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
  return sorted
}

// Dashboard screen: lists all current (not archived) applications
export default function Dashboard() {
  // Load the applications and track loading/error state
  const { data: applications, loading, error, reload } = useApi(() => api.getApplications(), [])

  // Which status chip is selected
  const [statusFilter, setStatusFilter] = useState('all')

  // "+" button in the header that opens Add Application
  const addButton = <IconButton icon="plus" label="Add application" variant="primary" to="/applications/new" />

  // What the user typed in the search box
  const [search, setSearch] = useState('')

  // Current sort option and whether the sort pop-up is open
  const [sortBy, setSortBy] = useState('newest')
  const [sortOpen, setSortOpen] = useState(false)

  // Show a spinner while the data is loading
  if (loading && !applications) {
    return (
      <Page title="Applications" action={addButton}>
        <LoadingState />
      </Page>
    )
  }

  // Show an error with a retry button if loading failed
  if (error) {
    return (
      <Page title="Applications" action={addButton}>
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  // Search text in lowercase, so "stripe" also finds "Stripe"
  const query = search.trim().toLowerCase()
  // Only the applications that match both the search and the selected status
    const visibleApplications = sortApplications(
    applications.filter(
      (application) =>
        (statusFilter === 'all' || application.status === statusFilter) &&
        (application.company.toLowerCase().includes(query) || application.position.toLowerCase().includes(query)),
    ),
    sortBy,
  )
  // Whether a search or a status filter is active
  const filtering = query !== '' || statusFilter !== 'all'

  return (
    <Page title="Applications" action={addButton}>
          {/* Search by company or position */}
      <SearchBar value={search} onChange={setSearch} placeholder="Search company or position" />
            {/* Status filter chips */}
      <FilterChips options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} label="Filter by status" />

      {/* How many applications are shown, plus a way to clear the filter */}
            <div className="dashboard__meta">
        <div className="dashboard__meta-left">
          <span className="dashboard__count">
            {visibleApplications.length} {visibleApplications.length === 1 ? 'application' : 'applications'}
          </span>
          {filtering && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
              }}
            >
              Clear filter
            </Button>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSortOpen(true)}>
          Sort: {getLabel(SORT_OPTIONS, sortBy)}
        </Button>
      </div>

      {/* One card per matching application, or a message if there are none */}
      {visibleApplications.length > 0 ? (
        visibleApplications.map((application) => <ApplicationCard key={application.id} application={application} />)
      ) : (
        <EmptyState title="No applications match" message="Try a different search or status." />
      )}

      {/* Sort pop-up */}
      <OptionSheet
        open={sortOpen}
        title="Sort by"
        options={SORT_OPTIONS}
        value={sortBy}
        onSelect={(value) => {
          setSortBy(value)
          setSortOpen(false)
        }}
        onCancel={() => setSortOpen(false)}
      />
    </Page>
  )
}