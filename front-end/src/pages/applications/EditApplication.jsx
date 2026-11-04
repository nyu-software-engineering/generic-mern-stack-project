import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api'
import { ErrorState, LoadingState, Page } from '../../components'
import { useApi } from '../../hooks/useApi'
import ApplicationForm from './ApplicationForm'
import { emptyRecruiter } from './applicationFormHelpers'

/**
 * Edit Application screen.
 * Owner: Bertin · Issues: #43, #49, #54
 * Wireframe: ux-design/prototype/edit-application.png · Pop-ups: changes-saved.png
 */
export default function EditApplication() {
  const { id } = useParams() // the :id from the URL, e.g. "app-1"
  const { data: application, loading, error, reload } = useApi(() => api.getApplication(id), [id])

  // While loading or if loading failed, show that instead of the form
  if (loading && !application) {
    return (
      <Page title="Edit Application" back>
        <LoadingState />
      </Page>
    )
  }
  if (error) {
    return (
      <Page title="Edit Application" back>
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  // The form starts from the loaded application, so it's only shown once the data is here
  return <EditApplicationForm application={application} />
}

function EditApplicationForm({ application }) {
  // The form starts filled in with the saved application
  const [form, setForm] = useState({
    company: application.company,
    position: application.position,
    dateApplied: application.dateApplied,
    status: application.status,
    jobType: application.jobType,
    location: application.location,
    jobPostingUrl: application.jobPostingUrl,
    notes: application.notes,
    // Show one empty contact if the application doesn't have a recruiter yet
    recruiters: application.recruiters.length > 0 ? application.recruiters : [emptyRecruiter()],
    resume: application.resume,
  })

  return (
    <Page title="Edit Application" back>
      <ApplicationForm form={form} onChange={setForm} errors={{}} />
    </Page>
  )
}