import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import {
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  FormSection,
  LoadingState,
  Page,
  SegmentedControl,
  SuccessDialog,
  TextArea,
  TextField,
} from '../../components'
import { useApi } from '../../hooks/useApi'
import { hasNoErrors, validateRequired } from '../../utils/validation'

const ROUND_TYPES = [
  { value: 'phone', label: 'Screen' },
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'final', label: 'Final' },
  { value: 'other', label: 'Other' },
]

async function loadRound(applicationId, roundId) {
  const application = await api.getApplication(applicationId)

  if (!roundId) {
    return { application, round: null }
  }

  const round = application.interviewRounds.find((item) => item.id === roundId) || null
  return { application, round }
}

async function findLinkedEvent(applicationId, roundId, fallbackName, fallbackDate) {
  const events = await api.getEvents({ applicationId })

  return (
    events.find((event) => event.roundId === roundId) ||
    events.find(
      (event) =>
        event.type === 'interview' &&
        event.title === fallbackName &&
        event.date === fallbackDate
    ) ||
    null
  )
}

export default function InterviewRound() {
  const { id, roundId } = useParams()
  const { data, loading, error, reload } = useApi(
    () => loadRound(id, roundId),
    [id, roundId]
  )

  if (loading && !data) {
    return (
      <Page title={roundId ? 'Edit Interview Round' : 'Add Interview Round'} back>
        <LoadingState />
      </Page>
    )
  }

  if (error) {
    return (
      <Page title={roundId ? 'Edit Interview Round' : 'Add Interview Round'} back>
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  if (!data?.application) {
    return (
      <Page title={roundId ? 'Edit Interview Round' : 'Add Interview Round'} back>
        <ErrorState message="Application not found." onRetry={reload} />
      </Page>
    )
  }

  return (
    <InterviewRoundForm
      application={data.application}
      round={data.round}
      isEditing={Boolean(roundId)}
    />
  )
}

function InterviewRoundForm({ application, round, isEditing }) {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: round?.name || '',
    type: round?.type || 'technical',
    date: round?.date || '',
    interviewer: round?.interviewer || '',
    notes: round?.notes || '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const errors = {
    name: validateRequired(form.name, 'Name'),
    date: validateRequired(form.date, 'Date'),
  }
  const shownErrors = submitted ? errors : {}

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setSaveError('')
  }

  async function handleSave() {
    if (saving) return

    setSubmitted(true)
    if (!hasNoErrors(errors)) return

    setSaving(true)
    setSaveError('')

    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        date: form.date,
        interviewer: form.interviewer.trim(),
        notes: form.notes.trim(),
      }

      if (isEditing) {
        const updated = await api.updateInterviewRound(application.id, round.id, payload)
        const linkedEvent = await findLinkedEvent(application.id, round.id, round.name, round.date)

        if (linkedEvent) {
          await api.updateEvent(linkedEvent.id, {
            applicationId: application.id,
            title: updated.name,
            type: 'interview',
            date: updated.date,
            time: linkedEvent.time || '',
            startTime: linkedEvent.startTime || linkedEvent.time || '',
            notes: updated.notes,
            roundId: updated.id,
          })
        } else {
          await api.createEvent({
            applicationId: application.id,
            title: updated.name,
            type: 'interview',
            date: updated.date,
            notes: updated.notes,
            roundId: updated.id,
          })
        }
      } else {
        const created = await api.addInterviewRound(application.id, payload)

        await api.createEvent({
          applicationId: application.id,
          title: created.name,
          type: 'interview',
          date: created.date,
          notes: created.notes,
          roundId: created.id,
        })
      }

      setSaved(true)
    } catch (err) {
      setSaveError(err.message || 'Could not save interview round. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (deleting || !isEditing) return

    setDeleting(true)
    try {
      const linkedEvent = await findLinkedEvent(application.id, round.id, round.name, round.date)
      await api.deleteInterviewRound(application.id, round.id)

      if (linkedEvent) {
        await api.deleteEvent(linkedEvent.id)
      }

      navigate(`/applications/${application.id}`)
    } catch (err) {
      setSaveError(err.message || 'Could not delete interview round. Please try again.')
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Page
      title={isEditing ? 'Edit Interview Round' : 'Add Interview Round'}
      back
      footer={
        <Button fullWidth loading={saving} onClick={handleSave}>
          {isEditing ? 'Save changes' : 'Save round'}
        </Button>
      }
    >
      <div className="stack">
        <FormSection title="Application">
          <Card padding="none">
            <div className="event-details__application">
              <Avatar src={application.logoUrl} alt={`${application.company} logo`} size={44} />

              <div className="event-details__application-info">
                <p className="event-details__application-name">{application.company}</p>
                <p className="event-details__application-role">{application.position}</p>
              </div>

              <Button variant="ghost" size="sm" to={`/applications/${application.id}`}>
                View
              </Button>
            </div>
          </Card>
        </FormSection>

        <FormSection title="Interview round">
          <TextField
            label="Name"
            placeholder="e.g. Technical screen"
            value={form.name}
            onChange={(value) => update('name', value)}
            required
            error={shownErrors.name}
          />

          <SegmentedControl
            label="Round type"
            options={ROUND_TYPES}
            value={form.type}
            onChange={(value) => update('type', value)}
          />

          <div className="field-row">
            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={(value) => update('date', value)}
              required
              error={shownErrors.date}
            />

            <TextField
              label="Interviewer"
              placeholder="Name"
              value={form.interviewer}
              onChange={(value) => update('interviewer', value)}
            />
          </div>

          <TextArea
            label="Notes"
            placeholder="What happened, what to prepare, or follow-up notes"
            value={form.notes}
            onChange={(value) => update('notes', value)}
            rows={4}
          />
        </FormSection>

        {saveError && (
          <p className="field__error" role="alert">
            {saveError}
          </p>
        )}

        {isEditing && (
          <div className="edit-event__delete">
            <Button variant="secondary" fullWidth icon="trash" onClick={() => setDeleteOpen(true)}>
              Delete round
            </Button>
          </div>
        )}
      </div>

      <SuccessDialog
        open={saved}
        title="Round saved"
        message={
          isEditing
            ? 'Your interview round details have been updated.'
            : 'Your interview round has been added.'
        }
        onDone={() => navigate(`/applications/${application.id}`)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete round?"
        message="This interview round and its event will be permanently removed."
        confirmLabel="Delete round"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Page>
  )
}
