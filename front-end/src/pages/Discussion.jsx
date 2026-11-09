import { useEffect, useState } from 'react'
import { getJob } from '../jobs/api.js'
import { useAppState } from '../data/useAppState.js'
import './Discussion.css'

const TOPICS = ['Interview', 'Assessment', 'Sponsorship', 'Update']

function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000)
  if (days < 1) return 'Today'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export function PostItem({ post }) {
  return (
    <li className="discussion-post">
      <p><strong>{post.anonymous ? 'Anonymous' : post.author}</strong> <span>{timeAgo(post.createdAt)}</span></p>
      <span className="discussion-tag">{post.topic}</span>
      <p>{post.body}</p>
    </li>
  )
}

export default function Discussion({ jobId }) {
  const appState = useAppState()
  const [job, setJob] = useState(null)
  const [topic, setTopic] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [newTopic, setNewTopic] = useState('Interview')
  const [body, setBody] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getJob(jobId).then(setJob, () => setJob(null))
  }, [jobId])

  const jobPosts = appState.posts.filter((post) => post.jobId === jobId)
  const shown = topic === 'All' ? jobPosts : jobPosts.filter((post) => post.topic === topic)

  function closeForm() {
    setShowForm(false)
    setNewTopic('Interview')
    setBody('')
    setAnonymous(false)
    setError('')
  }

  function handlePost() {
    if (!body.trim()) {
      setError('Please write something before posting.')
      return
    }
    appState.addPost(jobId, { topic: newTopic, body: body.trim(), anonymous, author: appState.profile?.name })
    setTopic('All')
    closeForm()
  }

  return (
    <section className="discussion">
      <a className="job-back" href={`#/jobs/${jobId}`}>Back to job</a>
      <h1>Discussion</h1>
      {job && <p>{job.title} | {job.company}</p>}

      <div className="discussion-topics">
        {['All', ...TOPICS].map((name) => (
          <button key={name} type="button" aria-pressed={topic === name} onClick={() => setTopic(name)}>
            {name}
          </button>
        ))}
      </div>

      <button type="button" className="ui-button discussion-new" onClick={() => setShowForm(true)}>
        New Post
      </button>

      {showForm && (
        <section className="discussion-form" aria-labelledby="new-post-title">
          <h2 id="new-post-title">New Post</h2>

          <label htmlFor="new-post-topic">Topic</label>
          <select id="new-post-topic" className="ui-field" value={newTopic} onChange={(event) => setNewTopic(event.target.value)}>
            {TOPICS.map((name) => <option key={name}>{name}</option>)}
          </select>

          <label htmlFor="new-post-body">Your post</label>
          <textarea id="new-post-body" className="ui-field" rows={4} value={body}
            placeholder="Share interview timelines, assessments, or sponsorship info..."
            onChange={(event) => { setBody(event.target.value); setError('') }} />
          {error && <p className="discussion-error" role="alert">{error}</p>}

          <label>
            <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
            {' '}Post anonymously
          </label>

          <div className="discussion-actions">
            <button type="button" className="ui-button ui-button-secondary" onClick={closeForm}>Cancel</button>
            <button type="button" className="ui-button" onClick={handlePost}>Post</button>
          </div>
        </section>
      )}

      {shown.length === 0 ? (
        <p>{jobPosts.length === 0 ? 'No posts yet.' : `No ${topic} posts yet.`}</p>
      ) : (
        <ul className="discussion-list">
          {shown.map((post) => <PostItem key={post.id} post={post} />)}
        </ul>
      )}
    </section>
  )
}
