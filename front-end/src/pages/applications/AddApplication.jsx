import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Button,
  FileUpload,
  FormSection,
  Modal,
  Page,
  SegmentedControl,
  SelectField,
  SuccessDialog,
  TextArea,
  TextField,
} from '../../components'
import { APPLICATION_STATUSES, JOB_TYPES } from '../../constants'
import { formatDate, todayString } from '../../utils/format'
import {
  emptyRecruiter,
  getApplicationErrors,
  isApplicationValid,
  removeEmptyRecruiters,
} from './applicationFormHelpers'
import './AddApplication.css'

/**
 * Add Application screen.
 * Written By: Bertin · Issues: #1, #17, #49, #54
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
  const [resumeError, setResumeError] = useState('') // message shown if the chosen file isn't a PDF
  const [duplicate, setDuplicate] = useState(null) // an existing application with the same company and position

  // Company and position are required. check whether the email is valid
  const errors = getApplicationErrors(form)

  // Only show errors after the user has tried to save once
  const shownErrors = submitted ? errors : {}

  // Returns a function that updates one field of the form, e.g. update('company')
  function update(field) {
    return (value) => {
      setForm({ ...form, [field]: value })
    }
  }

  // Returns a function that updates one field of one recruiter, e.g. updateRecruiter(0, 'name')
  function updateRecruiter(index, field) {
    return (value) => {
      const recruiters = form.recruiters.map((recruiter, i) =>
        i === index ? { ...recruiter, [field]: value } : recruiter,
      )
      setForm({ ...form, recruiters })
    }
  }

  // function for adding a recruiter contact info
  function addRecruiter() {
    setForm({ ...form, recruiters: [...form.recruiters, emptyRecruiter()] })
  }

  // function that removes a recruiter contact
  function removeRecruiter(index) {
    setForm({ ...form, recruiters: form.recruiters.filter((recruiter, i) => i !== index) })
  }

  // Called with the file the user picked
    // Called with the file the user picked. Only the file name is saved for now (Sprint 1 mock data).
  function handleResumeChosen(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Choose a PDF file')
      return
    }
    setResumeError('')
    setForm({ ...form, resume: { fileName: file.name, uploadedAt: todayString() } })
  }

  function removeResume() {
    setResumeError('')
    setForm({ ...form, resume: null })
  }

  // Sends the application to the api and shows the "Application saved" pop-up
  async function saveApplication() {
    // Don't save recruiter contacts that were left completely empty
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

  // Save anyway in the duplicate warning
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
      <div className="stack">
        <p className="add-application__hint">* Required fields</p>

        <FormSection title="Job">
          <TextField
            label="Company"
            required
            placeholder="e.g. ApplyTrack"
            value={form.company}
            onChange={update('company')}
            error={shownErrors.company}
          />
          <TextField
            label="Position"
            required
            placeholder="e.g. Software Engineering Intern"
            value={form.position}
            onChange={update('position')}
            error={shownErrors.position}
          />
          <div className="field-row">
            <TextField
              label="Date applied"
              type="date"
              value={form.dateApplied}
              onChange={update('dateApplied')}
            />
            <SelectField
              label="Status"
              options={APPLICATION_STATUSES}
              value={form.status}
              onChange={update('status')}
            />
          </div>
          <SegmentedControl
            label="Job type"
            options={JOB_TYPES}
            value={form.jobType}
            onChange={update('jobType')}
          />
          <TextField
            label="Location"
            placeholder="City, country"
            value={form.location}
            onChange={update('location')}
          />
          <TextField
            label="Job posting link"
            type="url"
            placeholder="https://"
            value={form.jobPostingUrl}
            onChange={update('jobPostingUrl')}
          />
        </FormSection>

        <FormSection title="Recruiter contact">
          {form.recruiters.map((recruiter, index) => (
            <div className="add-application__contact" key={index}>
              {index > 0 && (
                <div className="add-application__contact-header">
                  <span className="add-application__contact-title">Contact {index + 1}</span>
                  <Button variant="danger" size="sm" icon="trash" onClick={() => removeRecruiter(index)}>
                    Remove
                  </Button>
                </div>
              )}
              <TextField
                label="Name"
                placeholder="Recruiter name"
                value={recruiter.name}
                onChange={updateRecruiter(index, 'name')}
              />
              <TextField
                label="Email"
                type="email"
                placeholder="name@company.com"
                value={recruiter.email}
                onChange={updateRecruiter(index, 'email')}
                error={shownErrors.recruiterEmails?.[index]}
              />
              <TextField
                label="Phone"
                type="tel"
                placeholder="Phone number"
                value={recruiter.phone}
                onChange={updateRecruiter(index, 'phone')}
              />
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            icon="plus"
            className="add-application__add-contact"
            onClick={addRecruiter}
          >
            Add another contact
          </Button>
        </FormSection>
        
        <FormSection title="Resume used">
          <FileUpload
            label="Upload resume (PDF)"
            fileName={form.resume?.fileName}
            onChange={handleResumeChosen}
          />
          {resumeError && (
            <p className="field__error" role="alert">
              {resumeError}
            </p>
          )}

          {form.resume && (
            <Button
              variant="danger"
              size="sm"
              icon="trash"
              className="add-application__remove-resume"
              onClick={removeResume}
            >
              Remove resume
            </Button>
          )}
        </FormSection>
        <FormSection title="Notes">
          <TextArea
            label="Notes"
            placeholder="Any other notes"
            value={form.notes}
            onChange={update('notes')}
          />
        </FormSection>

        {saveError && (
          <p className="field__error" role="alert">
            {saveError}
          </p>
        )}
      </div>

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