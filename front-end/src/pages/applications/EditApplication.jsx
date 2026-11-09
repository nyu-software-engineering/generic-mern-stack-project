import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import { Button, ConfirmDialog, ErrorState, LoadingState, Page, SuccessDialog } from '../../components'
import { useApi } from '../../hooks/useApi'
import ApplicationForm from './ApplicationForm'
import {
  emptyRecruiter,
  getApplicationErrors,
  isApplicationValid,
  removeEmptyRecruiters,
} from './applicationFormHelpers'

/**
 * Edit Application screen.
 * Written By Bertin · Issues
 */
export default function EditApplication() {
  const { id } = useParams() // the :id from the URL, e.g. "app-1"
  const { data: application, loading, error, reload } = useApi(() => api.getApplication(id), [id])

  // While loading or if loading failed, show that instead of the form
  if (loading && !application) {
    return (
      <Page title="Edit Application" back>
        <LoadingState />
      </Page>
    )
  }
  if (error) {
    return (
      <Page title="Edit Application" back>
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  // The form starts from the loaded application, so it's only shown once the data is here
  return <EditApplicationForm application={application} />
}

function EditApplicationForm({ application }) {
  const navigate = useNavigate()

  // The form starts filled in with the saved application
  const [form, setForm] = useState({
    company: application.company,
    position: application.position,
    dateApplied: application.dateApplied,
    status: application.status,
    jobType: application.jobType,
    location: application.location,
    jobPostingUrl: application.jobPostingUrl,
    notes: application.notes,
    // Show one empty contact if the application doesn't have a recruiter yet
    recruiters: application.recruiters.length > 0 ? application.recruiters : [emptyRecruiter()],
    resume: application.resume,
  })
  const [submitted, setSubmitted] = useState(false) // true after the first tap on Save
  const [saving, setSaving] = useState(false) // true while the changes are being saved
  const [saved, setSaved] = useState(false) // true when the "Changes saved" pop-up should show
  const [saveError, setSaveError] = useState('') // message shown if saving fails
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const errors = getApplicationErrors(form)
  // Only show errors after the user has tried to save once
  const shownErrors = submitted ? errors : {}

  async function handleSave() {
    setSubmitted(true)
    if (!isApplicationValid(errors)) return

    setSaving(true)
    setSaveError('')
    try {
      await api.updateApplication(application.id, { ...form, recruiters: removeEmptyRecruiters(form.recruiters) })
      setSaved(true)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.deleteApplication(application.id)
      navigate('/applications', { replace: true })
    } catch (err) {
      setDeleteError(err.message)
      setDeleteOpen(false)
      setDeleting(false)
    }
  }

  return (
    <Page
      title="Edit Application"
      back
      footer={
        <Button fullWidth loading={saving} onClick={handleSave}>
          Save changes
        </Button>
      }
    >
      <ApplicationForm form={form} onChange={setForm} errors={shownErrors} />

      {saveError && (
        <p className="field__error" role="alert">
          {saveError}
        </p>
      )}

      <div className="edit-application__delete">
        <Button variant="secondary" fullWidth icon="trash" onClick={() => setDeleteOpen(true)}>
          Delete application
        </Button>
      </div>

      {deleteError && (
        <p className="field__error" role="alert">
          {deleteError}
        </p>
      )}

      <SuccessDialog
        open={saved}
        title="Changes saved"
        message="Your application has been updated."
        onDone={() => navigate(`/applications/${application.id}`)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete application?"
        message="This application and its events will be deleted. This can't be undone."
        confirmLabel="Delete application"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Page>
  )
}