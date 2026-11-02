import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Button,
  FileUpload,
  FormSection,
  Page,
  SegmentedControl,
  SelectField,
  SuccessDialog,
  TextArea,
  TextField,
} from '../../components'
import { APPLICATION_STATUSES, JOB_TYPES } from '../../constants'
import { todayString } from '../../utils/format'
import { hasNoErrors, validateEmail, validateRequired } from '../../utils/validation'
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
    recruiters: [{ name: '', email: '', phone: '' }],
    resume: null,
  })
  const [submitted, setSubmitted] = useState(false) // true after the first tap on Save
  const [saving, setSaving] = useState(false) // true while the application is being saved
  const [saved, setSaved] = useState(false) // true when the "Application saved" pop-up should show
  const [saveError, setSaveError] = useState('') // message shown if saving fails
  const [resumeError, setResumeError] = useState('') // message shown if the chosen file isn't a PDF

  // Company and position are required; every other field is optional
  const errors = {
    company: validateRequired(form.company, 'Company'),
    position: validateRequired(form.position, 'Position'),
  }

  // A recruiter's email is optional, but if one is typed it must be actual email
  const recruiterEmailErrors = form.recruiters.map((recruiter) =>
    recruiter.email ? validateEmail(recruiter.email) : '',
  )

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
    setForm({ ...form, recruiters: [...form.recruiters, { name: '', email: '', phone: '' }] })
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
    const recruiters = form.recruiters.filter(
      (recruiter) => recruiter.name.trim() || recruiter.email.trim() || recruiter.phone.trim(),
    )
    await api.createApplication({ ...form, recruiters })
    setSaved(true)
  }

  async function handleSave() {
    setSubmitted(true)
    if (!hasNoErrors(errors) || !hasNoErrors(recruiterEmailErrors)) return

    // Don't save recruiter contacts that were left completely empty
    const recruiters = form.recruiters.filter(
      (recruiter) => recruiter.name.trim() || recruiter.email.trim() || recruiter.phone.trim(),
    )

    setSaving(true)
    setSaveError('')
    try {
      await api.createApplication({ ...form, recruiters })
      setSaved(true)
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
                error={submitted ? recruiterEmailErrors[index] : ''}
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

      <SuccessDialog
        open={saved}
        title="Application saved"
        message="You can find it on your dashboard."
        onDone={() => navigate('/applications')}
      />
    </Page>
  )
}