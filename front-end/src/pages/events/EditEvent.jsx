
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import {
  Button,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  Page,
  SuccessDialog,
} from '../../components'
import { useApi } from '../../hooks/useApi'
import { hasNoErrors, validateRequired } from '../../utils/validation'
import EventForm from './EventForm'
import './EditEvent.css'

async function loadEventWithApplication(id) {
  const [event, applications] = await Promise.all([
    api.getEvent(id),
    api.getApplications({ includeArchived: true }),
  ])
  const application = applications.find(
    (item) => item.id === event.applicationId
  ) || null

  return { event, application, applications }
}

export default function EditEvent() {
  const { id } = useParams()

  const {
    data,
    loading,
    error,
    reload,
  } = useApi(() => loadEventWithApplication(id), [id])

  if (loading && !data) {
    return (
      <Page title="Edit Event" back>
        <LoadingState />
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Edit Event" back>
        <ErrorState
          message={error.message}
          onRetry={reload}
        />
      </Page>
    )
  }

  return data ? (
    <EditEventForm
      event={data.event}
      currentApplication={data.application}
      applications={data.applications}
    />
  ) : null
}

function EditEventForm({
  event,
  currentApplication,
  applications,
}) {
  const navigate = useNavigate()

  const initialApplicationId =
    applications.some(
      (application) => application.id === event.applicationId
    )
      ? event.applicationId
      : ''

  const [form, setForm] = useState({
    applicationId: String(initialApplicationId),

    title: event.title || '',
    type: event.type || 'deadline',
    date: event.date || '',
    time: event.startTime || event.time || '',

    reminderEnabled: event.reminder?.enabled ?? false,
    reminderBefore: event.reminder?.before || '2-hours',

    notes: event.notes || '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const applicationOptions = applications

  const errors = {
    title: validateRequired(form.title, 'Title'),
    date: validateRequired(form.date, 'Date'),
  }

  const shownErrors = submitted ? errors : {}

  function handleFormChange(next) {
    setForm(next)
    setSaveError('')
    setDeleteError('')
  }

  async function handleSave() {
    if (saving) return

    setSubmitted(true)

    if (!hasNoErrors(errors)) return

    setSaving(true)
    setSaveError('')

    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        date: form.date,

        time: form.time,
        startTime: form.time,

        // Preserve existing fields that are not editable
        // in the Figma layout.
        endTime: event.endTime || '',
        location: event.location || '',

        reminder: {
          enabled: form.reminderEnabled,
          before: form.reminderBefore,
        },

        notes: form.notes.trim(),
      }

      payload.applicationId = form.applicationId || null

      await api.updateEvent(event.id, payload)

      setSaved(true)
    } catch (err) {
      setSaveError(
        err.message || 'Could not save event. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (deleting) return

    setDeleting(true)
    setDeleteError('')

    try {
      await api.deleteEvent(event.id)
      navigate('/upcoming')
    } catch (err) {
      setDeleteError(
        err.message || 'Could not delete event. Please try again.'
      )
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Page
      title="Edit Event"
      back
      footer={
        <Button
          fullWidth
          loading={saving}
          onClick={handleSave}
        >
          Save changes
        </Button>
      }
    >
      <div className="edit-event-page">
        <EventForm
          form={form}
          onChange={handleFormChange}
          errors={shownErrors}
          applications={applicationOptions}
          currentApplication={currentApplication}
        />

        {saveError && (
          <p className="edit-event__error" role="alert">
            {saveError}
          </p>
        )}

        {deleteError && (
          <p className="edit-event__error" role="alert">
            {deleteError}
          </p>
        )}

        <div className="edit-event__delete">
          <Button
            variant="secondary"
            fullWidth
            icon="trash"
            onClick={() => setDeleteOpen(true)}
          >
            Delete event
          </Button>
        </div>
      </div>

      <SuccessDialog
        open={saved}
        title="Event saved"
        message="Your event details have been updated."
        onDone={() => navigate(`/events/${event.id}`)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete event?"
        message="This event will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete event"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) {
            setDeleteOpen(false)
          }
        }}
      />
    </Page>
  )
}
