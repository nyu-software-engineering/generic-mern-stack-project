
import {
  Avatar,
  Button,
  Card,
  FormSection,
  ListRow,
  SegmentedControl,
  SelectField,
  Switch,
  TextArea,
  TextField,
} from '../../components'
import { EVENT_TYPES, REMINDER_OPTIONS } from '../../constants'


export default function EventForm({
  form,
  onChange,
  errors = {},
  applications = [],
  currentApplication = null,
}) {
  function update(field, value) {
    onChange({
      ...form,
      [field]: value,
    })
  }

  const eventTypes = [
    { value: 'deadline', label: 'Deadline' },
    { value: 'interview', label: 'Interview' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'other', label: 'Other' },
  ]

  const types = eventTypes.map((type) => {
    const match = EVENT_TYPES.find(
      (option) =>
        option.value === type.value ||
        option.label.toLowerCase() === type.label.toLowerCase()
    )

    return {
      value: match?.value ?? type.value,
      label: type.label,
    }
  })

  function getApplicationDetails(application) {
    const company =
      application.company?.name ||
      application.companyName ||
      (typeof application.company === 'string'
        ? application.company
        : '') ||
      'Company'

    const position =
      application.position ||
      application.jobTitle ||
      application.title ||
      'Position'

    return { company, position }
  }

  const relatedApplication =
    currentApplication ||
    applications.find(
      (application) => String(application.id) === String(form.applicationId)
    ) ||
    null

  const applicationDetails = relatedApplication
    ? getApplicationDetails(relatedApplication)
    : { company: 'Application', position: 'Not linked' }

  return (
    <div className="edit-event">
      <FormSection title="Event">
        <div className="field">
          <label className="field__label">Application</label>
          <Card padding="none">
            {relatedApplication ? (
              <div className="event-details__application">
                <Avatar
                  src={relatedApplication.logoUrl || relatedApplication.logo}
                  alt={`${applicationDetails.company} logo`}
                  size={44}
                />

                <div className="event-details__application-info">
                  <p className="event-details__application-name">
                    {applicationDetails.company}
                  </p>

                  <p className="event-details__application-role">
                    {applicationDetails.position}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  to={`/applications/${relatedApplication.id}`}
                >
                  View
                </Button>
              </div>
            ) : (
              <ListRow
                icon="briefcase"
                title="No linked application"
                subtitle="This event is not linked to an application"
              />
            )}
          </Card>
        </div>

        <SegmentedControl
          label="Type"
          options={types}
          value={form.type}
          onChange={(value) => update('type', value)}
        />

        <TextField
          label="Title"
          value={form.title}
          onChange={(value) => update('title', value)}
          placeholder="Title"
          required
          error={errors.title}
        />

        <div className="field-row">
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(value) => update('date', value)}
            required
            error={errors.date}
          />

          <TextField
            label="Time"
            type="time"
            value={form.time}
            onChange={(value) => update('time', value)}
          />
        </div>

        <TextArea
          label="Notes"
          value={form.notes}
          onChange={(value) => update('notes', value)}
          placeholder="Any notes"
          rows={4}
        />
      </FormSection>

      <FormSection title="Reminder">
        <Switch
          label="Remind me"
          description="Get a reminder before this event"
          checked={form.reminderEnabled}
          onChange={(checked) => update('reminderEnabled', checked)}
        />

        <SelectField
          label="When"
          options={REMINDER_OPTIONS}
          value={form.reminderBefore}
          onChange={(value) => update('reminderBefore', value)}
          disabled={!form.reminderEnabled}
        />
      </FormSection>
    </div>
  )
}
