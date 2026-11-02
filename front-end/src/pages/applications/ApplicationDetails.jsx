import { useParams } from 'react-router-dom'
import { api } from '../../api'
import { Avatar, Button, Card, ErrorState, ListRow, LoadingState, Page, SectionHeader, StatusBadge } from '../../components'
import { getLabel, getStatus, JOB_TYPES } from '../../constants'
import { useApi } from '../../hooks/useApi'
import { formatDate } from '../../utils/format'
import './ApplicationDetails.css'

// Application Details screen: shows everything saved about one application
export default function ApplicationDetails() {
  // Read the application id from the URL
  const { id } = useParams()
  // Load the application and track loading/error state
  const { data: application, loading, error, reload } = useApi(() => api.getApplication(id), [id])

  // "Edit" link in the top right of the header
  const editButton = (
    <Button variant="ghost" size="sm" to={`/applications/${id}/edit`}>
      Edit
    </Button>
  )

  // Show a spinner while the data is loading
  if (loading && !application) {
    return (
      <Page title="Application" back action={editButton}>
        <LoadingState />
      </Page>
    )
  }

  // Show an error with a retry button if loading failed
  if (error) {
    return (
      <Page title="Application" back>
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  // Location and job type on one line, skipping empty parts
  const details = [application.location, getLabel(JOB_TYPES, application.jobType)].filter(Boolean).join(' · ')
  // Status history with the newest status first
  const statusHistory = [...application.statusHistory].reverse()

  return (
    <Page title="Application" back action={editButton}>
      {/* Summary card: logo, company, position, status */}
      <Card>
        <div className="application-details__header">
          <Avatar src={application.logoUrl} alt={`${application.company} logo`} size={64} />
          <div className="application-details__titles">
            <h2 className="application-details__company">{application.company}</h2>
            <p className="application-details__position">{application.position}</p>
            {details && <p className="application-details__meta">{details}</p>}
            <p className="application-details__meta">Applied {formatDate(application.dateApplied)}</p>
          </div>
        </div>
        <div className="application-details__status-row">
          <StatusBadge status={application.status} />
        </div>
      </Card>

      {/* Job posting link, only shown if one was saved */}
      {application.jobPostingUrl && (
        <Card padding="none">
          <ListRow
            icon="link"
            title="View job posting"
            subtitle={application.jobPostingUrl}
            href={application.jobPostingUrl}
          />
        </Card>
      )}

      {/* Status history list, current status highlighted */}
      <section className="application-details__section">
        <SectionHeader title="Status history" />
        <Card>
          <ol className="application-details__history">
            {statusHistory.map((entry, index) => (
              <li
                key={`${entry.status}-${entry.date}`}
                className={`application-details__history-item ${index === 0 ? 'application-details__history-item--current' : ''}`}
              >
                <span className="application-details__history-dot" />
                <span className="application-details__history-label">{getStatus(entry.status).label}</span>
                <span className="application-details__history-date">{formatDate(entry.date)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </section>
    </Page>
  )
}