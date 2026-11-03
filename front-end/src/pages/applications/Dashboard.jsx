import { api } from '../../api'
import { ApplicationCard, Button, EmptyState, ErrorState, FilterChips, IconButton, LoadingState, Page } from '../../components'
import { APPLICATION_STATUSES } from '../../constants'
import { useApi } from '../../hooks/useApi'
import { useState } from 'react'
import './Dashboard.css'

// "All" plus one chip per status, using the short labels (e.g. "OA")
const STATUS_FILTERS = [{ value: 'all', label: 'All' }, ...APPLICATION_STATUSES.map((status) => ({ value: status.value, label: status.shortLabel }))]

// Dashboard screen: lists all current (not archived) applications
export default function Dashboard() {
  // Load the applications and track loading/error state
  const { data: applications, loading, error, reload } = useApi(() => api.getApplications(), [])

  // Which status chip is selected
  const [statusFilter, setStatusFilter] = useState('all')

  // "+" button in the header that opens Add Application
  const addButton = <IconButton icon="plus" label="Add application" variant="primary" to="/applications/new" />

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

  // Only the applications that match the selected status
  const visibleApplications =
    statusFilter === 'all' ? applications : applications.filter((application) => application.status === statusFilter)
  
  return (
    <Page title="Applications" action={addButton}>
            {/* Status filter chips */}
      <FilterChips options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} label="Filter by status" />

      {/* How many applications are shown, plus a way to clear the filter */}
      <div className="dashboard__meta">
        <span className="dashboard__count">
          {visibleApplications.length} {visibleApplications.length === 1 ? 'application' : 'applications'}
        </span>
        {statusFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')}>
            Clear filter
          </Button>
        )}
      </div>

      {/* One card per matching application, or a message if there are none */}
      {visibleApplications.length > 0 ? (
        visibleApplications.map((application) => <ApplicationCard key={application.id} application={application} />)
      ) : (
        <EmptyState title="No applications match" message="Try a different status." />
      )}
    </Page>
  )
}