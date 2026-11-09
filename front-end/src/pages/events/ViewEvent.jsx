
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import {
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  DateTile,
  ErrorState,
  ListRow,
  LoadingState,
  Page,
  SectionHeader,
} from '../../components'
import { useApi } from '../../hooks/useApi'
import { formatTime, parseDate } from '../../utils/format'
import './ViewEvent.css'

// Load the event and its related application
async function loadDetails(id) {
  const event = await api.getEvent(id)

  const application = event.applicationId
    ? await api.getApplication(event.applicationId)
    : null

  return { event, application }
}

function formatTimeRange(start, end) {
  if (!start && !end) return 'Time not set'
  if (start && end) {
    return `${formatTime(start)} - ${formatTime(end)}`
  }
  if (start) return formatTime(start)
  return `Ends ${formatTime(end)}`
}

function getEventType(type) {
  const labels = {
    interview: 'Interview',
    deadline: 'Deadline',
    follow_up: 'Follow-up',
    'follow-up': 'Follow-up',
    networking: 'Networking',
    other: 'Other',
  }

  return labels[type] || type || 'Event'
}

// Event Details screen
export default function ViewEvent() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, loading, error, reload } = useApi(
    () => loadDetails(id),
    [id]
  )

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Edit button in the header
  const editButton = (
    <Button
      variant="ghost"
      size="sm"
      to={`/events/${id}/edit`}
    >
      Edit
    </Button>
  )

  if (loading && !data) {
    return (
      <Page title="Event" back action={editButton}>
        <LoadingState />
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Event" back>
        <ErrorState
          message={error.message}
          onRetry={reload}
        />
      </Page>
    )
  }

  if (!data?.event) {
    return (
      <Page title="Event" back>
        <ErrorState
          message="Event not found."
          onRetry={reload}
        />
      </Page>
    )
  }

  const { event, application } = data
  const date = parseDate(event.date)
  const time = formatTimeRange(
    event.startTime || event.time,
    event.endTime
  )
  const dateTitle = date
    ? date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : 'Date not set'
  const dateSubtitle = date
    ? `${date.getFullYear()} · ${time}`
    : time

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')

    try {
      await api.deleteEvent(id)
      navigate('/calendar')
    } catch (err) {
      setDeleteError(
        err.message || 'Could not delete event.'
      )
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Page title="Event" back action={editButton}>
      {/* Main event card */}
      <Card>
        <div className="event-details__hero">
          <span className="event-details__badge">
            {getEventType(event.type)}
          </span>

          <h1 className="event-details__title">
            {event.title}
          </h1>

          {application && (
            <p className="event-details__subtitle">
              {application.company}
              {application.position &&
                ` · ${application.position}`}
            </p>
          )}

          <div className="event-details__divider" />

          {/* Date and time */}
          <div className="event-details__date-row">
            <DateTile date={event.date} />

            <div className="event-details__date-info">

              <p className="event-details__date-title">
                {dateTitle}
              </p>

              <p className="event-details__date-subtitle">
                {dateSubtitle}
              </p>
            </div>
          </div>

          {/* Notes inside the main card */}
          {event.notes && (
            <>
              <div className="event-details__divider" />

              <div className="event-details__notes-section">
                <p className="event-details__overline">
                  NOTES
                </p>

                <div className="event-details__notes">
                  {event.notes}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Related application */}
      <section className="event-details__section">
        <SectionHeader title="Related application" />

        <Card padding="none">
          {application ? (
            <div className="event-details__application">
              <Avatar
                src={application.logoUrl}
                alt={`${application.company} logo`}
                size={44}
              />

              <div className="event-details__application-info">
                <p className="event-details__application-name">
                  {application.company}
                </p>

                <p className="event-details__application-role">
                  {application.position}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                to={`/applications/${application.id}`}
              >
                View
              </Button>
            </div>
          ) : (
            <ListRow
              icon="briefcase"
              title="No linked application"
              subtitle="This event is not linked to an application"
            />
          )}
        </Card>
      </section>

      {/* Other details */}
      <section className="event-details__section">
        <SectionHeader title="Other details" />

        <Card padding="none">
          <ListRow
            icon="map-pin"
            title="Location"
            subtitle={event.location || 'Not added'}
          />
        </Card>
      </section>

      {/* Delete event */}
      <div className="event-details__delete-section">
        {deleteError && (
          <p
            className="event-details__error"
            role="alert"
          >
            {deleteError}
          </p>
        )}

        <Button
          variant="secondary"
          fullWidth
          onClick={() => setDeleteOpen(true)}
        >
          Delete event
        </Button>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete event?"
        message="This event will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete event"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Page>
  )
}
