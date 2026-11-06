import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { Button, ConfirmDialog } from '../../components'

/**
 * "Delete application" button with its "Are you sure?" pop-up.
 * Written By Bertin · Issue: #46
 *
 * @param applicationId  the id of the application to delete
 *
 * @example
 * <DeleteApplicationButton applicationId={id} />
 */
export default function DeleteApplicationButton({ applicationId }) {
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false) // true when the pop-up is showing
  const [deleting, setDeleting] = useState(false) // true while the application is being deleted
  const [deleteError, setDeleteError] = useState('') // message shown if deleting fails

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.deleteApplication(applicationId)
      // Go back to the dashboard; replace so the back button doesn't return to the deleted application
      navigate('/applications', { replace: true })
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <Button variant="ghost" fullWidth onClick={() => setConfirmOpen(true)}>
        Delete application
      </Button>

      {deleteError && (
        <p className="field__error" role="alert">
          {deleteError}
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete application?"
        message="This application and its events will be deleted. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </>
  )
}