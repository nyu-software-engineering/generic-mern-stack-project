import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { Button, Modal, Page, SuccessDialog } from '../../components'
import { formatDate, todayString } from '../../utils/format'
import ApplicationForm from './ApplicationForm'
import {
  emptyRecruiter,
  getApplicationErrors,
  isApplicationValid,
  removeEmptyRecruiters,
} from './applicationFormHelpers'

/**
 * Add Application screen.
 * Owner: Bertin · Issues: #1, #17, #49, #54
 * Wireframe: ux-design/prototype/add-application.png · Pop-ups: application-saved.png
 */
export default function AddApplication() {
  const navigate = useNavigate()

  // Everything the user types into the form, kept in one object
  const [form, setForm] = useState({
    company: '',
    position: '',
    dateApplied: todayString(),
    status: 'applied',
    jobType: 'internship',
    location: '',
    jobPostingUrl: '',
    notes: '',
    recruiters: [emptyRecruiter()],
    resume: null,
  })
  const [submitted, setSubmitted] = useState(false) // true after the first tap on Save
  const [saving, setSaving] = useState(false) // true while the application is being saved
  const [saved, setSaved] = useState(false) // true when the "Application saved" pop-up should show
  const [saveError, setSaveError] = useState('') // message shown if saving fails
  const [duplicate, setDuplicate] = useState(null) // an existing application with the same company and position

  const errors = getApplicationErrors(form)
  // Only show errors after the user has tried to save once
  const shownErrors = submitted ? errors : {}

  // Sends the application to the api and shows the "Application saved" pop-up
  async function saveApplication() {
    await api.createApplication({ ...form, recruiters: removeEmptyRecruiters(form.recruiters) })
    setSaved(true)
  }

  async function handleSave() {
    setSubmitted(true)
    if (!isApplicationValid(errors)) return

    setSaving(true)
    setSaveError('')
    try {
      // If this company and position were already added, warn the user instead of saving
      const existing = await api.findDuplicateApplication({ company: form.company, position: form.position })
      if (existing) {
        setDuplicate(existing)
        return
      }
      await saveApplication()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // "Save anyway" in the duplicate warning
  async function handleSaveAnyway() {
    setDuplicate(null)
    setSaving(true)
    setSaveError('')
    try {
      await saveApplication()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page
      title="Add Application"
      back
      footer={
        <Button fullWidth loading={saving} onClick={handleSave}>
          Save application
        </Button>
      }
    >
      <ApplicationForm form={form} onChange={setForm} errors={shownErrors} />

      {saveError && (
        <p className="field__error" role="alert">
          {saveError}
        </p>
      )}

      <Modal open={duplicate !== null} onClose={() => setDuplicate(null)} title="Already saved">
        <div className="dialog__body">
          <h2 className="dialog__title">Already saved</h2>
          <p className="dialog__message">
            You already have {duplicate?.company} – {duplicate?.position}, added{' '}
            {formatDate(duplicate?.dateApplied)}. Save this one anyway?
          </p>
        </div>
        <div className="dialog__actions dialog__actions--single">
          <Button onClick={() => navigate(`/applications/${duplicate?.id}`)}>View existing</Button>
          <Button variant="secondary" onClick={handleSaveAnyway}>
            Save anyway
          </Button>
          <Button variant="ghost" onClick={() => setDuplicate(null)}>
            Cancel
          </Button>
        </div>
      </Modal>

      <SuccessDialog
        open={saved}
        title="Application saved"
        message="You can find it on your dashboard."
        onDone={() => navigate('/applications')}
      />
    </Page>
  )
}