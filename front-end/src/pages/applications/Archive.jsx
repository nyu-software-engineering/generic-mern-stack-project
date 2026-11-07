import { useState } from 'react'
import { api } from '../../api'
import { ApplicationCard, Button, ConfirmDialog, EmptyState, ErrorState, LoadingState, Page } from '../../components'
import { useApi } from '../../hooks/useApi'
import './Archive.css'

// Archive screen: lists applications from past recruiting seasons
export default function Archive() {
  // Load the archived applications and track loading/error state
   const { data: applications, setData, loading, error, reload } = useApi(() => api.getArchivedApplications(), [])
   // The application waiting for "Unarchive?" confirmation, and whether it's saving
  const [unarchiving, setUnarchiving] = useState(null)
  const [saving, setSaving] = useState(false)

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

  return (
    <Page title="Archived" back>
      {/* How many applications are archived */}
      <p className="archive__count">{applications.length} archived</p>

      {/* One card per archived application, or a message if there are none */}
      {applications.length > 0 ? (
                applications.map((application) => (
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
