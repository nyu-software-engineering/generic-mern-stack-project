import { api } from '../../api'
import { ApplicationCard, EmptyState, ErrorState, LoadingState, Page } from '../../components'
import { useApi } from '../../hooks/useApi'
import './Archive.css'

// Archive screen: lists applications from past recruiting seasons
export default function Archive() {
  // Load the archived applications and track loading/error state
  const { data: applications, loading, error, reload } = useApi(() => api.getArchivedApplications(), [])

  // Show a spinner while the data is loading
  if (loading && !applications) {
    return (
      <Page title="Archived" back>
        <LoadingState />
      </Page>
    )
  }

  // Show an error with a retry button if loading failed
  if (error) {
    return (
      <Page title="Archived" back>
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  return (
    <Page title="Archived" back>
      {/* How many applications are archived */}
      <p className="archive__count">{applications.length} archived</p>

      {/* One card per archived application, or a message if there are none */}
      {applications.length > 0 ? (
        applications.map((application) => <ApplicationCard key={application.id} application={application} />)
      ) : (
        <EmptyState title="Nothing archived" message="Archived applications from past seasons will show up here." />
      )}
    </Page>
  )
}
