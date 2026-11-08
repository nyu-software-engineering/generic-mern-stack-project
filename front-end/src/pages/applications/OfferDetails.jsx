import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import { Avatar, Button, Card, ErrorState, FormSection, LoadingState, Page, SegmentedControl, SelectField, SuccessDialog, TextArea, TextField } from '../../components'
import { OFFER_DECISIONS, REMINDER_OPTIONS } from '../../constants'
import { useApi } from '../../hooks/useApi'
import './OfferDetails.css'

// Starting values for an application that has no offer saved yet
const EMPTY_OFFER = {
  baseSalary: '',
  signingBonus: '',
  startDate: '',
  location: '',
  respondBy: '',
  remindBefore: '2-days',
  decision: 'pending',
  notes: '',
}

// Offer Details screen: record and edit the details of an offer
export default function OfferDetails() {
  // Read the application id from the URL
  const { id } = useParams()
  // Used to go back to the application after saving
  const navigate = useNavigate()
  // Load the application and track loading/error state
  const { data: application, setData, loading, error, reload } = useApi(() => api.getApplication(id), [id])
  // Whether it's saving, whether it saved, and any error from saving
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Show a spinner while the data is loading
  if (loading && !application) {
    return (
      <Page title="Offer Details" back>
        <LoadingState />
      </Page>
    )
  }

  // Show an error with a retry button if loading failed
  if (error) {
    return (
      <Page title="Offer Details" back>
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  // The offer being edited: the saved one, or an empty one using the job's location
  const offer = application.offer ?? { ...EMPTY_OFFER, location: application.location }

  // Update one field of the offer
  function update(field, value) {
    setData({ ...application, offer: { ...offer, [field]: value } })
  }

  // Save the offer, then show the "Offer saved" pop-up
  async function save() {
    setSaving(true)
    setSaveError('')
    try {
      await api.saveOffer(id, offer)
      setSaved(true)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // "Save offer" button fixed at the bottom of the screen
  const saveButton = (
    <Button fullWidth loading={saving} onClick={save}>
      Save offer
    </Button>
  )

  return (
    <Page title="Offer Details" back footer={saveButton}>
      {/* Which application this offer is for */}
      <Card>
        <div className="offer-details__job">
          <Avatar src={application.logoUrl} alt={`${application.company} logo`} size={48} />
          <div className="offer-details__titles">
            <p className="offer-details__company">{application.company}</p>
            <p className="offer-details__position">{application.position}</p>
          </div>
        </div>
      </Card>

      {/* Pay, start date and location */}
      <FormSection title="Offer">
        <TextField
          label="Base salary"
          placeholder="e.g. $9,000/month"
          value={offer.baseSalary}
          onChange={(value) => update('baseSalary', value)}
        />
        <TextField
          label="Signing bonus"
          placeholder="e.g. $3,000"
          value={offer.signingBonus}
          onChange={(value) => update('signingBonus', value)}
        />
        <TextField
          label="Start date"
          type="date"
          value={offer.startDate}
          onChange={(value) => update('startDate', value)}
        />
        <TextField
          label="Location"
          placeholder="City, State"
          value={offer.location}
          onChange={(value) => update('location', value)}
        />
      </FormSection>

      {/* When to respond, and when to be reminded */}
      <FormSection title="Deadline">
        <TextField
          label="Respond by"
          type="date"
          value={offer.respondBy}
          onChange={(value) => update('respondBy', value)}
        />
        <SelectField
          label="Remind me"
          options={REMINDER_OPTIONS}
          value={offer.remindBefore}
          onChange={(value) => update('remindBefore', value)}
        />
      </FormSection>

      {/* Pending, accepted or declined */}
      <FormSection title="Decision">
        <SegmentedControl
          label="Status"
          options={OFFER_DECISIONS}
          value={offer.decision}
          onChange={(value) => update('decision', value)}
        />
      </FormSection>

      {/* Anything else to remember */}
      <FormSection title="Notes">
        <TextArea
          label="Notes"
          placeholder="Record any notes"
          value={offer.notes}
          onChange={(value) => update('notes', value)}
        />
      </FormSection>

      {/* Error message if saving fails */}
      {saveError && (
        <p className="offer-details__error" role="alert">
          {saveError}
        </p>
      )}

      {/* "Offer saved" pop-up, then back to the application */}
      <SuccessDialog
        open={saved}
        title="Offer saved"
        message="Your offer details were saved to this application."
        onDone={() => navigate(`/applications/${id}`)}
      />
    </Page>
  )
}