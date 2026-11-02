import { api } from '../../api'
import { ApplicationCard, EmptyState, ErrorState, IconButton, LoadingState, Page } from '../../components'
import { useApi } from '../../hooks/useApi'

// Dashboard screen: lists all current (not archived) applications
export default function Dashboard() {
  // Load the applications and track loading/error state
  const { data: applications, loading, error, reload } = useApi(() => api.getApplications(), [])

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

  return (
    <Page title="Applications" action={addButton}>
      {/* One card per application, or a message if there are none */}
      {applications.length > 0 ? (
        applications.map((application) => <ApplicationCard key={application.id} application={application} />)
      ) : (
        <EmptyState title="No applications yet" message="Add your first application to start tracking it." />
      )}
    </Page>
  )
}