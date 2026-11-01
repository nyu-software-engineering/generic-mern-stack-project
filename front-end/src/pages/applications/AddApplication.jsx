import { useState } from 'react'
import { FormSection, Page, SegmentedControl, SelectField, TextArea, TextField } from '../../components'
import { APPLICATION_STATUSES, JOB_TYPES } from '../../constants'
import { todayString } from '../../utils/format'
import './AddApplication.css'

/**
 * Add Application screen.
 * Written By: Bertin · Issues: #1, #17, #49, #54
 */
export default function AddApplication() {
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

  // Returns a function that updates one field of the form, e.g. update('company')
  function update(field) {
    return (value) => {
      setForm({ ...form, [field]: value })
    }
  }

  return (
    <Page title="Add Application" back>
      <div className="stack">
        <p className="add-application__hint">* Required fields</p>

        <FormSection title="Job">
          <TextField
            label="Company"
            required
            placeholder="e.g. ApplyTrack"
            value={form.company}
            onChange={update('company')}
          />
          <TextField
            label="Position"
            required
            placeholder="e.g. Software Engineering Intern"
            value={form.position}
            onChange={update('position')}
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
      </div>
    </Page>
  )
}