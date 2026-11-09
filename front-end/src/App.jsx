
import { useEffect, useState } from 'react'
import { getJob, getJobs } from './jobs/api.js'
import { getJobHref, parseJobRoute } from './jobs/routes.js'
import { DEFAULT_FILTERS } from './jobs/browse.js'
import BrowseJobs from './pages/BrowseJobs.jsx'
import JobDetails from './pages/JobDetails.jsx'
import { useAppState } from './data/useAppState.js'
import EditProfile from './pages/EditProfile.jsx'
import MyProfile from './pages/MyProfile.jsx'
import Tracker from './pages/Tracker.jsx'
import Welcome from './pages/Welcome.jsx'
import SignUp from './pages/SignUp.jsx'
import LogIn from './pages/LogIn.jsx'
import Menu from './components/Menu.jsx'
import { useJobMatch } from './jobs/useJobMatch.js'
import ProfileSetup from './pages/ProfileSetup.jsx'
import Home from './pages/Home.jsx'
import Deadlines from './pages/Deadlines.jsx'


function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const [attempt, setAttempt] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [resources, setResources] = useState({ browse: null, details: null })
  const [browseFilters, setBrowseFilters] = useState(DEFAULT_FILTERS)
  const appState = useAppState()
  const path = hash.replace(/^#/, '') || '/'
  const [browseQuery, setBrowseQuery] = useState('')
  const [browseSort, setBrowseSort] = useState('best-match')
  const route = parseJobRoute(hash)
  const match = useJobMatch(route.kind === 'details' ? route.id : null, appState)
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

  // Issue #66: Save a job from Job Details to Tracker
  function saveCurrentJobToTracker({ stage, note }) {
    if (appState.status !== 'ready' || !appState.addApplication) {
      return {
        ok: false,
        message: 'Tracker is currently unavailable.',
      }
    }

    if (route.kind !== 'details' || current.status !== 'ready' || !current.data?.id) {
      return {
        ok: false,
        message: 'Job information is unavailable.',
      }
    }

    const saved = appState.addApplication(
      current.data.id,
      stage,
      note
    )

    return saved
      ? {
          ok: true,
          message: 'Job saved to Tracker.',
        }
      : {
          ok: false,
          message: 'This job is already in your Tracker.',
        }
  }

  function logOut() {
    appState.resetAll()
    setMenuOpen(false)
    setResources({ browse: null, details: null })
    setBrowseFilters(DEFAULT_FILTERS)
    setBrowseQuery('')
    setBrowseSort('best-match')
    setAttempt(0)
    setHash('#/welcome')
    window.location.hash = '#/welcome'
  }

  const signedOutScreens = {
    '/welcome': <Welcome />,
    '/login': <LogIn />,
    '/signup': <SignUp />,
  }
  if (signedOutScreens[path]) {
    return <main className="app">{signedOutScreens[path]}</main>
  }

  return (
    <main className="app">
      <header className="app-header">
        <a href="#/home" aria-label="CareerHive — Home">CareerHive</a>
        <button type="button" className="ui-button ui-button-secondary" onClick={() => setMenuOpen(true)}>Menu</button>
      </header>
      {menuOpen && <Menu onClose={() => setMenuOpen(false)} onLogOut={logOut} />}
      <p className="demo-notice">Fictional listings. Application links open example pages.</p>
      {path === '/profile-setup' ? (
        <ProfileSetup />
      ) : path === '/home' ? (
        <Home />
      ) : path === '/profile' ? (
        <MyProfile />
      ) : path === '/profile/edit' ? (
        <EditProfile />
      ) : path === '/tracker' || path.startsWith('/tracker?') ? (
        <Tracker initialStage={new URLSearchParams(path.split('?')[1] || '').get('stage')} />
      ) : path === '/deadlines' ? (
        <Deadlines />
      ) : route.kind === 'browse' ? (
        <BrowseJobs jobs={current.data ?? []} status={current.status} onRetry={retry} getJobHref={getJobHref}
          filters={browseFilters} onFiltersChange={setBrowseFilters} profile={appState.profile}
          query={browseQuery} onQueryChange={setBrowseQuery} sort={browseSort} onSortChange={setBrowseSort} />
      ) : route.kind === 'details' ? (
        <JobDetails job={current.data} status={current.status} onRetry={retry}
          onSaveToTracker={
            appState.status === 'ready' && current.status === 'ready'
              ? saveCurrentJobToTracker
              : undefined
          }
          matchResource={match.resource}
          onMatchRetry={appState.status === 'ready' ? match.retry : undefined}
          onCompleteProfile={() => { window.location.hash = '#/profile/edit' }} />
      ) : (
        <section className="browse-state"><h1>Page not found</h1><a href="#/jobs">Back to jobs</a></section>
      )}
    </main>
  )
}

export default App
