// ---- 1. Imports: tools from other files ----
import { useParams } from 'react-router-dom' // reads the :id from the URL
import { api } from '../../api' // where all data comes from (mock data for now)
import { Avatar, Button, Card, ErrorState, LoadingState, Page, StatusBadge } from '../../components' // shared building blocks
import { getLabel, JOB_TYPES } from '../../constants' // turns "internship" into "Internship"
import { useApi } from '../../hooks/useApi' // loads data and tracks loading/errors
import { formatDate } from '../../utils/format' // turns "2026-09-08" into "Sep 8, 2026"
import './ApplicationDetails.css' // this page's styling

/**
 * Application Details screen: everything saved about one application.
 * Owner: Estifanos · Issues: #39, #67, #18, #16
 * Wireframe: ux-design/prototype/application-details.png
 */
export default function ApplicationDetails() {
  // ---- 2. Get the id and load the application ----
  const { id } = useParams() // e.g. "app-1" from /applications/app-1
  const { data: application, loading, error, reload } = useApi(() => api.getApplication(id), [id])

  // ---- 3. The "Edit" link in the top right ----
  const editButton = (
    <Button variant="ghost" size="sm" to={`/applications/${id}/edit`}>
      Edit
    </Button>
  )

  // ---- 4. While loading: show a spinner ----
  if (loading && !application) {
    return (
      <Page title="Application" back action={editButton}>
        <LoadingState />
      </Page>
    )
  }

  // ---- 5. If loading failed: show an error with a "Try again" button ----
  if (error) {
    return (
      <Page title="Application" back>
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  // ---- 6. Build the "New York, NY · Internship" line (skips empty parts) ----
  const details = [application.location, getLabel(JOB_TYPES, application.jobType)].filter(Boolean).join(' · ')

  // ---- 7. The page itself ----
  return (
    <Page title="Application" back action={editButton}>
      <Card>
        {/* Logo on the left, text on the right */}
        <div className="application-details__header">
          <Avatar src={application.logoUrl} alt={`${application.company} logo`} size={64} />
          <div className="application-details__titles">
            <h2 className="application-details__company">{application.company}</h2>
            <p className="application-details__position">{application.position}</p>
            {details && <p className="application-details__meta">{details}</p>}
            <p className="application-details__meta">Applied {formatDate(application.dateApplied)}</p>
          </div>
        </div>

        {/* Status badge under a divider line */}
        <div className="application-details__status-row">
          <StatusBadge status={application.status} />
        </div>
      </Card>
    </Page>
  )
}