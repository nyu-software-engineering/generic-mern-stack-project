import { useState } from 'react'
import { loadInvitations, respondToInvitation } from '../api/invites.js'
import { useApi } from './useApi.js'

export function useInvitations() {
  const { data, loading, error, retry: reload, setData } = useApi(loadInvitations)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  function retry() {
    setActionError('')
    reload()
  }

  async function answer(id, response) {
    if (busy) return null
    setBusy(true)
    setActionError('')
    try {
      const result = await respondToInvitation(id, response)
      setData((current) => (current ?? []).filter((invite) => invite.id !== id))
      return result
    } catch (err) {
      setActionError(err.message || 'Could not respond to this invitation.')
      if (err.status === 404) reload()
      return null
    } finally {
      setBusy(false)
    }
  }

  return { invites: data ?? [], loading, error: actionError || error?.message, retry, busy, answer }
}
