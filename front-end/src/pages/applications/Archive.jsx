import { useState } from 'react'
import { api } from '../../api'
import { ApplicationCard, Button, ConfirmDialog, EmptyState, ErrorState, LoadingState, Page, SelectField } from '../../components'
import { useApi } from '../../hooks/useApi'
import './Archive.css'

// Archive screen: lists applications from past recruiting seasons
export default function Archive() {
  // Load the archived applications and track loading/error state
  const { data: applications, setData, loading, error, reload } = useApi(() => api.getArchivedApplications(), [])
  // The application waiting for "Unarchive?" confirmation, and whether it's saving
  const [unarchiving, setUnarchiving] = useState(null)
  const [saving, setSaving] = useState(false)
  // Which year is selected in the Year dropdown
  const [year, setYear] = useState('all')

  // Show a spinner while the data is loading
  if (loading && !applications) {
    return (
      <Page title="Archived" back>
        <LoadingState />
      </Page>
    )
  }

  // Show an error with a retry button if loading failed
  if (error) {
    return (
      <Page title="Archived" back>
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }
    // Unarchive the confirmed application and remove it from this list
  async function confirmUnarchive() {
    setSaving(true)
    try {
      await api.unarchiveApplication(unarchiving.id)
      setData((current) => current.filter((application) => application.id !== unarchiving.id))
      setUnarchiving(null)
    } finally {
      setSaving(false)
    }
  }

    // Every year that has an archived application, newest first
  const years = [...new Set(applications.map((application) => application.dateApplied.slice(0, 4)))].sort().reverse()
  // Dropdown options: "All years" plus one per year
  const yearOptions = [{ value: 'all', label: 'All years' }, ...years.map((value) => ({ value, label: value }))]
  // Only the applications from the selected year
  const visibleApplications =
    year === 'all' ? applications : applications.filter((application) => application.dateApplied.startsWith(year))

  return (
    <Page title="Archived" back>
            {/* Pick a recruiting season */}
      <SelectField label="Year" options={yearOptions} value={year} onChange={setYear} />

      {/* How many archived applications are shown */}
      <p className="archive__count">{visibleApplications.length} archived</p>

            {/* One card per archived application, or a message if there are none */}
      {visibleApplications.length > 0 ? (
        visibleApplications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            trailing={
              <Button variant="secondary" size="sm" onClick={() => setUnarchiving(application)}>
                Unarchive
              </Button>
            }
          />
        ))
      ) : (
        <EmptyState title="Nothing archived" message="Archived applications from past seasons will show up here." />
      )}

      {/* "Unarchive?" pop-up */}
      <ConfirmDialog
        open={Boolean(unarchiving)}
        title="Unarchive application?"
        message="It will move back to your dashboard."
        confirmLabel="Unarchive"
        loading={saving}
        onConfirm={confirmUnarchive}
        onCancel={() => setUnarchiving(null)}
      />
    </Page>
  )
}
