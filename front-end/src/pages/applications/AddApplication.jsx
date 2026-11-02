import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Button,
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
import { hasNoErrors, validateRequired } from '../../utils/validation'
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
  })
  const [submitted, setSubmitted] = useState(false) // true after the first tap on Save
  const [saving, setSaving] = useState(false) // true while the application is being saved
  const [saved, setSaved] = useState(false) // true when the "Application saved" pop-up should show
  const [saveError, setSaveError] = useState('') // message shown if saving fails

  // Company and position are required; every other field is optional
  const errors = {
    company: validateRequired(form.company, 'Company'),
    position: validateRequired(form.position, 'Position'),
  }
  // Only show errors after the user has tried to save once
  const shownErrors = submitted ? errors : {}

  // Returns a function that updates one field of the form, e.g. update('company')
  function update(field) {
    return (value) => {
      setForm({ ...form, [field]: value })
    }
  }

  async function handleSave() {
    setSubmitted(true)
    if (!hasNoErrors(errors)) return

    setSaving(true)
    setSaveError('')
    try {
      await api.createApplication(form)
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