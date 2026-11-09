import { useCallback, useEffect, useState } from 'react'
import { AppStateContext } from './useAppState.js'
import { getApplications, getDiscussions, getMatch, getProfile } from './api.js'

function AppState(props) {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [original, setOriginal] = useState(null)
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([getProfile(), getApplications(), getDiscussions()])
      .then(([profile, applications, posts]) => {
        if (!active) return
        if (!profile || !Array.isArray(applications) || !Array.isArray(posts)) {
          throw new Error('Required CareerHive data is missing')
        }
        const firstCopy = { profile, applications, posts }
        setOriginal(structuredClone(firstCopy))
        setProfile(profile)
        setApplications(applications)
        setPosts(posts)
        setStatus('ready')
      })
      .catch(() => {
        if (!active) return
        setStatus('error')
        setMessage('Could not load CareerHive data. Reload the page to try again.')
      })
    return () => { active = false }
  }, [])

  function saveProfile(nextProfile) {
    setProfile((previous) => ({ ...nextProfile, id: previous.id, revision: previous.revision + 1 }))
  }

  function updateApplication(applicationId, change) {
    const at = new Date().toISOString()
    setApplications((previous) => previous.map((application) => {
      if (application.id !== applicationId) return application
      const history = change.stage && change.stage !== application.stage
        ? application.history.concat({ stage: change.stage, at })
        : application.history
      return {
        ...application,
        stage: change.stage || application.stage,
        note: change.note ?? application.note,
        updatedAt: at,
        history,
      }
    }))
  }

  function removeApplication(applicationId) {
    setApplications((previous) =>previous.filter((application) => application.id !== applicationId)
    )
  }

  // Issue #66: Save a job to the Tracker
  function addApplication(jobId, stage = 'Saved', note = '') {
    if (status !== 'ready' || !jobId) {
      return false
    }

    const alreadySaved = applications.some(
      (application) => application.jobId === jobId
    )

    if (alreadySaved) {
      return false
    }

    const at = new Date().toISOString()

    const newApplication = {
      id: 'application-' + crypto.randomUUID(),
      jobId,
      stage,
      note: note.trim(),
      updatedAt: at,
      history: [
        {
          stage,
          at,
        },
      ],
    }

    setApplications((previous) => {
      if (previous.some((application) => application.jobId === jobId)) {
        return previous
      }

      return [newApplication, ...previous]
    })

    return true
  }

  function addPost(jobId, post) {
    const nextPost = {
      id: 'post-' + crypto.randomUUID(),
      jobId: jobId,
      topic: post.topic,
      body: post.body,
      anonymous: Boolean(post.anonymous),
      author: post.author,
      createdAt: new Date().toISOString(),
    }
    setPosts((previous) => [nextPost, ...previous])
  }

  function resetAll() {
    if (!original) return
    const copy = structuredClone(original)
    setProfile(copy.profile)
    setApplications(copy.applications)
    setPosts(copy.posts)
    setStatus('ready')
    setMessage('')
  }

  const matchFor = useCallback(async (jobId, options) => {
    if (!profile || !profile.major?.trim() || !profile.graduationDate?.trim()
      || !profile.workAuthorization?.trim() || !profile.skills?.some((skill) => skill.trim())) {
      return { status: 'incomplete-profile' }
    }
    const match = await getMatch(jobId, profile, options)
    return { status: 'ready', data: match }
  }, [profile])

  const value = {
    status,
    message,
    profile,
    applications,
    posts,
    saveProfile,
    updateApplication,
    addApplication,
    addPost,
    resetAll,
    matchFor,
    removeApplication,
  }

  return (
    <AppStateContext.Provider value={value}>
      {props.children}
    </AppStateContext.Provider>
  )
}

export default AppState
