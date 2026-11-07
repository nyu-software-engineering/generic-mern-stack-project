import { useState } from 'react'
import {
  Button,
  FileUpload,
  FormSection,
  SegmentedControl,
  SelectField,
  TextArea,
  TextField,
} from '../../components'
import { APPLICATION_STATUSES, JOB_TYPES } from '../../constants'
import { todayString } from '../../utils/format'
import { emptyRecruiter } from './applicationFormHelpers'
import './ApplicationForm.css'

/**
 * The application form used by both Add Application and Edit Application.
 * The page that uses it keeps the form data and decides what Save does.
 *
 * @param form      the current form data (company, position, recruiters, resume...)
 * @param onChange  called with the whole updated form whenever the user changes something
 * @param errors    error messages to show, from getApplicationErrors(); pass {} to show none
 *
 * @example
 * <ApplicationForm form={form} onChange={setForm} errors={shownErrors} />
 */
export default function ApplicationForm({ form, onChange, errors }) {
  const [resumeError, setResumeError] = useState('') // message shown if the chosen file isn't a PDF

  // Returns a function that updates one field of the form, e.g. update('company')
  function update(field) {
    return (value) => {
      onChange({ ...form, [field]: value })
    }
  }

  // Returns a function that updates one field of one recruiter, e.g. updateRecruiter(0, 'name')
  function updateRecruiter(index, field) {
    return (value) => {
      const recruiters = form.recruiters.map((recruiter, i) =>
        i === index ? { ...recruiter, [field]: value } : recruiter,
      )
      onChange({ ...form, recruiters })
    }
  }

  function addRecruiter() {
    onChange({ ...form, recruiters: [...form.recruiters, emptyRecruiter()] })
  }

  function removeRecruiter(index) {
    onChange({ ...form, recruiters: form.recruiters.filter((recruiter, i) => i !== index) })
  }

  // Called with the file the user picked. Only the file name is saved for now (Sprint 1 mock data).
  function handleResumeChosen(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Choose a PDF file')
      return
    }
    setResumeError('')
    onChange({ ...form, resume: { fileName: file.name, uploadedAt: todayString() } })
  }

  function removeResume() {
    setResumeError('')
    onChange({ ...form, resume: null })
  }

  return (
    <div className="stack">
      <p className="application-form__hint">* Required fields</p>

      <FormSection title="Job">
        <TextField
          label="Company"
          required
          placeholder="e.g. ApplyTrack"
          value={form.company}
          onChange={update('company')}
          error={errors.company}
        />
        <TextField
          label="Position"
          required
          placeholder="e.g. Software Engineering Intern"
          value={form.position}
          onChange={update('position')}
          error={errors.position}
        />
        <div className="field-row">
          <TextField label="Date applied" type="date" value={form.dateApplied} onChange={update('dateApplied')} />
          <SelectField
            label="Status"
            options={APPLICATION_STATUSES}
            value={form.status}
            onChange={update('status')}
          />
        </div>
        <SegmentedControl label="Job type" options={JOB_TYPES} value={form.jobType} onChange={update('jobType')} />
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
          <div className="application-form__contact" key={index}>
            {index > 0 && (
              <div className="application-form__contact-header">
                <span className="application-form__contact-title">Contact {index + 1}</span>
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
              error={errors.recruiterEmails?.[index]}
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
          className="application-form__add-contact"
          onClick={addRecruiter}
        >
          Add another contact
        </Button>
      </FormSection>

      <FormSection title="Resume used">
        <FileUpload label="Upload resume (PDF)" fileName={form.resume?.fileName} onChange={handleResumeChosen} />
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
            className="application-form__remove-resume"
            onClick={removeResume}
          >
            Remove resume
          </Button>
        )}
      </FormSection>

      <FormSection title="Notes">
        <TextArea label="Notes" placeholder="Any other notes" value={form.notes} onChange={update('notes')} />
      </FormSection>
    </div>
  )
}