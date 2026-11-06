import { useEffect, useState } from 'react'
import { getJob, getJobs } from './jobs/api.js'
import { getJobHref, parseJobRoute } from './jobs/routes.js'
import { DEFAULT_FILTERS } from './jobs/browse.js'
import BrowseJobs from './pages/BrowseJobs.jsx'
import JobDetails from './pages/JobDetails.jsx'
import { useAppState } from './data/AppState.jsx'
import EditProfile from './pages/EditProfile.jsx'
import MyProfile from './pages/MyProfile.jsx'
import Tracker from './pages/Tracker.jsx'

function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const [attempt, setAttempt] = useState(0)

  const [resources, setResources] = useState({
    browse: null,
    details: null,
  })

  const [browseFilters, setBrowseFilters] = useState(DEFAULT_FILTERS)
  const [browseQuery, setBrowseQuery] = useState('')
  const [browseSort, setBrowseSort] = useState('best-match')

  const [matchResource, setMatchResource] = useState({
    status: 'loading',
  })

  const appState = useAppState()

  const path = hash.replace(/^#/, '') || '/'
  const route = parseJobRoute(hash)

  const requestKey = `${route.kind}:${route.id ?? ''}`
  const resource = resources[route.kind]

  const current =
    resource?.key === requestKey
      ? resource
      : {
          status: 'loading',
          data: null,
        }

  const browseLoaded =
    route.kind === 'browse' &&
    current.status === 'ready'

  const profile = appState?.profile ?? null

  useEffect(() => {
    function updateRoute() {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }

    window.addEventListener('hashchange', updateRoute)

    return () => {
      window.removeEventListener('hashchange', updateRoute)
    }
  }, [])

  useEffect(() => {
    if (
      route.kind === 'unknown' ||
      browseLoaded
    ) {
      return
    }

    const controller = new AbortController()
    let active = true

    const request =
      route.kind === 'details'
        ? getJob(route.id, {
            signal: controller.signal,
          })
        : getJobs({
            signal: controller.signal,
          })

    request.then(
      (data) => {
        if (!active) {
          return
        }

        setResources((previous) => ({
          ...previous,
          [route.kind]: {
            key: requestKey,
            status: 'ready',
            data,
          },
        }))
      },
      () => {
        if (!active) {
          return
        }

        setResources((previous) => ({
          ...previous,
          [route.kind]: {
            key: requestKey,
            status: 'error',
            data: null,
          },
        }))
      }
    )

    return () => {
      active = false
      controller.abort()
    }
  }, [
    requestKey,
    route.kind,
    route.id,
    attempt,
    browseLoaded,
  ])

  useEffect(() => {
    if (
      route.kind !== 'details' ||
      !profile ||
      !appState
    ) {
      return
    }

    let active = true

    appState.matchFor(route.id).then((nextResource) => {
      if (active) {
        setMatchResource(nextResource)
      }
    })

    return () => {
      active = false
    }
  }, [
    route.kind,
    route.id,
    profile,
    appState,
  ])

  function retry() {
    setResources((previous) => ({
      ...previous,
      [route.kind]: null,
    }))

    setAttempt((value) => value + 1)
  }

  function saveCurrentJobToTracker({
    stage,
    note,
  }) {
    if (!appState?.addApplication) {
      return {
        ok: false,
        message: 'Tracker is currently unavailable.',
      }
    }

    if (!current.data?.id) {
      return {
        ok: false,
        message: 'Job information is unavailable.',
      }
    }

    const saved = appState.addApplication(
      current.data.id,
      stage,
      note.trim()
    )

    if (!saved) {
      return {
        ok: false,
        message: 'This job is already in your Tracker.',
      }
    }

    return {
      ok: true,
      message: 'Job saved to Tracker.',
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <a
          href="#/jobs"
          aria-label="CareerHive — Browse Jobs"
        >
          CareerHive
        </a>

        <span>Demo</span>
      </header>

      <p className="demo-notice">
        Fictional listings. Application links open example pages.
      </p>

      {path === '/profile' ? (
        <MyProfile />
      ) : path === '/profile/edit' ? (
        <EditProfile />
      ) : path === '/tracker' ? (
        <Tracker />
      ) : route.kind === 'browse' ? (
        <BrowseJobs
          jobs={current.data ?? []}
          status={current.status}
          onRetry={retry}
          getJobHref={getJobHref}
          filters={browseFilters}
          onFiltersChange={setBrowseFilters}
          profile={profile}
          query={browseQuery}
          onQueryChange={setBrowseQuery}
          sort={browseSort}
          onSortChange={setBrowseSort}
        />
      ) : route.kind === 'details' ? (
        <JobDetails
          job={current.data}
          status={current.status}
          onRetry={retry}
          onSaveToTracker={
            appState?.addApplication
              ? saveCurrentJobToTracker
              : undefined
          }
          matchResource={matchResource}
          onMatchRetry={() => {
            if (!appState) {
              return
            }

            appState
              .matchFor(route.id)
              .then(setMatchResource)
          }}
          onCompleteProfile={() => {
            window.location.hash = '#/profile/edit'
          }}
        />
      ) : (
        <section className="browse-state">
          <h1>Page not found</h1>

          <a href="#/jobs">
            Back to jobs
          </a>
        </section>
      )}
    </main>
  )
}

export default App