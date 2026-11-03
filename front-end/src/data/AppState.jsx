import { createContext, useContext, useEffect, useState } from 'react'
import { getApplications, getDiscussions, getMatch, getProfile } from './api.js'

const AppStateContext = createContext(null)

export function useAppState() {
  return useContext(AppStateContext)
}

function AppState(props) {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [original, setOriginal] = useState(null)
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(() => {
    getProfile()
      .then((profileData) => {
        return getApplications().then((applicationData) => {
          return getDiscussions().then((postData) => {
            const firstCopy = {
              profile: profileData,
              applications: applicationData,
              posts: postData,
            }
            setOriginal(JSON.parse(JSON.stringify(firstCopy)))
            setProfile(firstCopy.profile)
            setApplications(firstCopy.applications)
            setPosts(firstCopy.posts)
            setStatus('ready')
          })
        })
      })
      .catch(() => {
        setStatus('error')
        setMessage('Could not load CareerHive data. Reload the page to try again.')
      })
  }, [])

  function saveProfile(nextProfile) {
    setProfile({ ...nextProfile, revision: profile.revision + 1 })
  }

  function updateApplication(applicationId, change) {
    const at = new Date().toISOString()
    const nextApplications = applications.map((application) => {
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
    })
    setApplications(nextApplications)
  }

  function addPost(jobId, post) {
    const nextPost = {
      id: 'post-' + Date.now(),
      jobId: jobId,
      topic: post.topic,
      body: post.body,
      anonymous: Boolean(post.anonymous),
      createdAt: new Date().toISOString(),
    }
    setPosts([nextPost].concat(posts))
  }

  function resetAll() {
    if (!original) return
    const copy = JSON.parse(JSON.stringify(original))
    setProfile(copy.profile)
    setApplications(copy.applications)
    setPosts(copy.posts)
    setStatus('ready')
    setMessage('')
  }

  function matchFor(jobId) {
    return getMatch(jobId).then((match) => {
        if (match === null) return { status: 'error', message: 'Match not found' }
        return {
        status: 'ready',
        data: {
            jobId: jobId,
            score: match.score,
            summary: 'Using saved skills: ' + profile.skills.join(', '),
            fitExplanation: profile.skills,
            missingSkills: match.missingSkills,
            keyQualifications: [profile.workAuthorization],
        },
        }
    })
  }

  const value = {
    status,
    message,
    profile,
    applications,
    posts,
    saveProfile,
    updateApplication,
    addPost,
    resetAll,
    matchFor,
  }

  return (
    <AppStateContext.Provider value={value}>
      {props.children}
    </AppStateContext.Provider>
  )
}

export default AppState