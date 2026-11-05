import { useEffect, useState } from 'react'

export function useJobMatch(jobId, { profile, status, message, matchFor }) {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState(null)

  useEffect(() => {
    if (!jobId || status !== 'ready') return
    const controller = new AbortController()
    let active = true
    Promise.resolve().then(() => matchFor(jobId, { signal: controller.signal })).then(
      (resource) => {
        if (active) setSettled({ jobId, profile, attempt, resource })
      },
      () => {
        if (active) setSettled({ jobId, profile, attempt, resource: { status: 'error', message: 'Match analysis could not be loaded.' } })
      },
    )
    return () => { active = false; controller.abort() }
  }, [jobId, profile, status, matchFor, attempt])

  // A new job, saved profile or retry hides the previous result before its request resolves.
  const current = settled?.jobId === jobId && settled.profile === profile && settled.attempt === attempt
  const resource = status === 'error'
    ? { status: 'error', message }
    : current ? settled.resource : { status: 'loading' }
  return { resource, retry: () => setAttempt((previous) => previous + 1) }
}
