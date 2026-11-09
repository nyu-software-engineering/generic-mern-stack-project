import { useState } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { api } from '../../api'
import {
  Button,
  ErrorState,
  LoadingState,
  Page,
  SuccessDialog,
} from '../../components'
import { useApi } from '../../hooks/useApi'
import { hasNoErrors, validateRequired } from '../../utils/validation'
import EventForm from './EventForm'
import './EditEvent.css'

export default function AddEvent() {
  const [searchParams] = useSearchParams()
  const {
    data: applications,
    loading,
    error,
    reload,
  } = useApi(
    () => api.getApplications({ includeArchived: true }),
    []
  )

  if (loading && !applications) {
    return (
      <Page title="Add Follow-up Event" back>
        <LoadingState />
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Add Follow-up Event" back>
        <ErrorState
          message={error.message}
          onRetry={reload}
        />
      </Page>
    )
  }

  const requestedApplicationId =
    searchParams.get('applicationId') || ''
  const initialApplicationId = applications?.some(
    (application) => application.id === requestedApplicationId
  )
    ? requestedApplicationId
    : ''

  return (
    <AddEventForm
      applications={applications || []}
      initialApplicationId={initialApplicationId}
    />
  )
}

function AddEventForm({
  applications,
  initialApplicationId,
}) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    applicationId: String(initialApplicationId),
    title: '',
    type: 'follow-up',
    date: '',
    time: '',
    reminderEnabled: false,
    reminderBefore: '2-hours',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedEventId, setSavedEventId] = useState('')

  const errors = {
    title: validateRequired(form.title, 'Title'),
    date: validateRequired(form.date, 'Date'),
  }
  const shownErrors = submitted ? errors : {}

  function handleFormChange(next) {
    setForm(next)
    setSaveError('')
  }

  async function handleSave() {
    if (saving) return

    setSubmitted(true)
    if (!hasNoErrors(errors)) return

    setSaving(true)
    setSaveError('')

    try {
      const created = await api.createEvent({
        applicationId: form.applicationId || null,
        title: form.title.trim(),
        type: form.type,
        date: form.date,
        time: form.time,
        startTime: form.time,
        reminder: {
          enabled: form.reminderEnabled,
          before: form.reminderBefore,
        },
        notes: form.notes.trim(),
      })

      setSavedEventId(created.id)
      setSaved(true)
    } catch (err) {
      setSaveError(
        err.message || 'Could not save event. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page
      title="Add Follow-up Event"
      back
      footer={
        <Button
          fullWidth
          loading={saving}
          onClick={handleSave}
        >
          Save event
        </Button>
      }
    >
      <div className="edit-event-page">
        <EventForm
          form={form}
          onChange={handleFormChange}
          errors={shownErrors}
          applications={applications}
        />

        {saveError && (
          <p className="edit-event__error" role="alert">
            {saveError}
          </p>
        )}
      </div>

      <SuccessDialog
        open={saved}
        title="Event saved"
        message="Your event has been added."
        onDone={() =>
          navigate(savedEventId ? `/events/${savedEventId}` : '/upcoming')
        }
      />
    </Page>
  )
}
