import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import {Avatar, Button, Card,ConfirmDialog, ErrorState, EventCard, ListRow, LoadingState, OptionSheet, Page, SectionHeader, StatusBadge,} from '../../components'
import { APPLICATION_STATUSES, getLabel, getStatus, JOB_TYPES, OFFER_DECISIONS } from '../../constants'
import { useApi } from '../../hooks/useApi'
import { formatDate, todayString } from '../../utils/format'
import DeleteApplicationButton from './DeleteApplicationButton'
import './ApplicationDetails.css'

// Load the application and its events at the same time
async function loadDetails(id) {
  const [application, events] = await Promise.all([api.getApplication(id), api.getEvents({ applicationId: id })])
  return { application, events }
}

// Application Details screen: shows everything saved about one application
export default function ApplicationDetails() {
  // Read the application id from the URL
  const { id } = useParams()
  // Load the data and track loading/error state
  const { data, setData, loading, error, reload } = useApi(() => loadDetails(id), [id])
  // Whether the Update status pop-up is open
  const [statusOpen, setStatusOpen] = useState(false)
  // Error message if saving a new status fails
  const [statusError, setStatusError] = useState('')
    // Used to go back to the dashboard after archiving
  const navigate = useNavigate()
  // Whether the archive pop-up is open, and whether it's saving
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  // "Edit" link in the top right of the header
  const editButton = (
    <Button variant="ghost" size="sm" to={`/applications/${id}/edit`}>
      Edit
    </Button>
  )

  // Show a spinner while the data is loading
  if (loading && !data) {
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

  // Split the loaded data into the application and its events
  const { application, events } = data
  // Location and job type on one line, skipping empty parts
  const details = [application.location, getLabel(JOB_TYPES, application.jobType)].filter(Boolean).join(' · ')
  // Status history with the newest status first
  const statusHistory = [...application.statusHistory].reverse()
  // Only events from today onward
  const upcomingEvents = events.filter((event) => event.date >= todayString())

  // Save the picked status and show the updated application
  async function changeStatus(status) {
    setStatusOpen(false)
    if (status === application.status) return
    setStatusError('')
    try {
      const updated = await api.updateApplication(id, { status })
      setData((current) => ({ ...current, application: updated }))
    } catch (err) {
      setStatusError(err.message)
    }
  }


  // Archive or unarchive the application, then go back to the dashboard
  async function toggleArchive() {
    setArchiving(true)
    try {
      if (application.archived) await api.unarchiveApplication(id)
      else await api.archiveApplication(id)
      navigate('/applications')
    } finally {
      setArchiving(false)
    }
  }

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
          <Button variant="secondary" size="sm" onClick={() => setStatusOpen(true)}>
            Update status
          </Button>
        </div>
        {statusError && (
          <p className="application-details__error" role="alert">
            {statusError}
          </p>
        )}
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
                key={`${entry.status}-${entry.date}-${index}`}
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

      {/* Upcoming events for this application, with a link to add one */}
      <section className="application-details__section">
        <SectionHeader title="Upcoming events" actionLabel="+ Add event" actionTo={`/events/new?applicationId=${id}`} />
        {upcomingEvents.length > 0 ? (
          <Card padding="none">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} application={application} />
            ))}
          </Card>
        ) : (
          <Card>
            <p className="application-details__empty">No upcoming events.</p>
          </Card>
        )}
      </section>

      {/* Interview rounds, each one opens its own page */}
      <section className="application-details__section">
        <SectionHeader title="Interview rounds" actionLabel="+ Add round" actionTo={`/applications/${id}/rounds/new`} />
        {application.interviewRounds.length > 0 ? (
          application.interviewRounds.map((round) => (
            <Card key={round.id} to={`/applications/${id}/rounds/${round.id}`}>
              <p className="application-details__round-title">{round.name}</p>
              <p className="application-details__meta">
                {formatDate(round.date)}
                {round.interviewer && ` · with ${round.interviewer}`}
              </p>
              {round.notes && <p className="application-details__round-notes">{round.notes}</p>}
            </Card>
          ))
        ) : (
          <Card>
            <p className="application-details__empty">No interview rounds yet.</p>
          </Card>
        )}
      </section>

            {/* Offer summary, or a link to add the offer */}
      <section className="application-details__section">
        <SectionHeader title="Offer" />
        <Card padding="none">
          {application.offer ? (
            <ListRow
              title={application.offer.baseSalary || 'Offer details'}
              subtitle={[
                application.offer.respondBy && `Respond by ${formatDate(application.offer.respondBy)}`,
                getLabel(OFFER_DECISIONS, application.offer.decision),
              ]
                .filter(Boolean)
                .join(' · ')}
              to={`/applications/${id}/offer`}
            />
          ) : (
            <ListRow
              title="Add offer details"
              subtitle="Salary, start date, deadline to respond"
              to={`/applications/${id}/offer`}
            />
          )}
        </Card>
      </section>
      
      {/* Recruiter contact, email and phone open the mail and phone apps */}
      <section className="application-details__section">
        <SectionHeader title="Recruiter" />
        {application.recruiters.length > 0 ? (
          application.recruiters.map((recruiter) => (
            <Card key={recruiter.email || recruiter.name} padding="none">
              <ListRow icon="user" title={recruiter.name} />
              {recruiter.email && <ListRow icon="mail" title={recruiter.email} href={`mailto:${recruiter.email}`} />}
              {recruiter.phone && <ListRow icon="phone" title={recruiter.phone} href={`tel:${recruiter.phone}`} />}
            </Card>
          ))
        ) : (
          <Card>
            <p className="application-details__empty">No recruiter added.</p>
          </Card>
        )}
      </section>

      {/* Resume used for this application */}
      <section className="application-details__section">
        <SectionHeader title="Resume used" />
        {application.resume ? (
          <Card padding="none">
            <ListRow
              icon="file"
              title={application.resume.fileName}
              subtitle={application.resume.uploadedAt && `Uploaded ${formatDate(application.resume.uploadedAt)}`}
            />
          </Card>
        ) : (
          <Card>
            <p className="application-details__empty">No resume recorded.</p>
          </Card>
        )}
      </section>

      {/* Notes, only shown if there are any */}
      {application.notes && (
        <section className="application-details__section">
          <SectionHeader title="Notes" />
          <Card>
            <p className="application-details__notes">{application.notes}</p>
          </Card>
        </section>
      )}
            {/* Archive or unarchive this application */}
      <Button variant="secondary" fullWidth onClick={() => setArchiveOpen(true)}>
        {application.archived ? 'Unarchive application' : 'Archive application'}
      </Button>

      {/* Delete application button */}
      <DeleteApplicationButton applicationId={id} />

      {/* Update status pop-up with every status to pick from */}
      <OptionSheet
        open={statusOpen}
        title="Update status"
        options={APPLICATION_STATUSES}
        value={application.status}
        onSelect={changeStatus}
        onCancel={() => setStatusOpen(false)}
      />

      {/* "Are you sure?" pop-up for archiving or unarchiving */}
      <ConfirmDialog
        open={archiveOpen}
        title={application.archived ? 'Unarchive application?' : 'Archive application?'}
        message={
          application.archived
            ? 'It will move back to your dashboard.'
            : 'It will be hidden from your dashboard. You can unarchive it anytime from Archive.'
        }
        confirmLabel={application.archived ? 'Unarchive' : 'Archive'}
        loading={archiving}
        onConfirm={toggleArchive}
        onCancel={() => setArchiveOpen(false)}
      />
    </Page>
  )
}