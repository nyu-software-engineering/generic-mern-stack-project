import { useEffect, useState } from 'react'
import { getJob, getJobs } from './jobs/api.js'
import { getJobHref, parseJobRoute } from './jobs/routes.js'
import BrowseJobs from './pages/BrowseJobs.jsx'
import JobDetails from './pages/JobDetails.jsx'

function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const [attempt, setAttempt] = useState(0)
  const [resources, setResources] = useState({ browse: null, details: null })
  const route = parseJobRoute(hash)
  const requestKey = `${route.kind}:${route.id ?? ''}`
  const resource = resources[route.kind]
  const current = resource?.key === requestKey ? resource : { status: 'loading', data: null }
  const browseLoaded = route.kind === 'browse' && current.status === 'ready'

  useEffect(() => {
    function updateRoute() {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    if (route.kind === 'unknown' || browseLoaded) return
    const controller = new AbortController()
    let active = true
    const request = route.kind === 'details'
      ? getJob(route.id, { signal: controller.signal })
      : getJobs({ signal: controller.signal })
    request.then((data) => {
      if (active) {
        setResources((previous) => ({
          ...previous, [route.kind]: { key: requestKey, status: 'ready', data },
        }))
      }
    }, () => {
      if (active) {
        setResources((previous) => ({
          ...previous, [route.kind]: { key: requestKey, status: 'error', data: null },
        }))
      }
    })
    return () => { active = false; controller.abort() }
  }, [requestKey, route.kind, route.id, attempt, browseLoaded])

  function retry() {
    setResources((previous) => ({ ...previous, [route.kind]: null }))
    setAttempt((value) => value + 1)
  }

  return (
    <main className="app">
      <header className="app-header">
        <a href="#/jobs" aria-label="CareerHive — Browse Jobs">CareerHive</a>
        <span>Demo</span>
      </header>
      <p className="demo-notice">Fictional listings. Application links open example pages.</p>
      {route.kind === 'browse' ? (
        <BrowseJobs jobs={current.data ?? []} status={current.status} onRetry={retry} getJobHref={getJobHref} />
      ) : route.kind === 'details' ? (
        <JobDetails job={current.data} status={current.status} onRetry={retry} />
      ) : (
        <section className="browse-state"><h1>Page not found</h1><a href="#/jobs">Back to jobs</a></section>
      )}
    </main>
  )
}

export default App
