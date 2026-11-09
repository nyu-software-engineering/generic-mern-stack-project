
import { useState } from 'react'
import { formatJobDate, formatSponsorship, getApplicationHref } from '../jobs/formatters.js'
import JobMatch from './JobMatch.jsx'
import './JobDetails.css'

export default function JobDetails({
  job, status = 'ready', onRetry, onSaveToTracker, onOpenAnalysis, onOpenDiscussion,
  matchResource, onMatchRetry, onCompleteProfile,
}) {
  // Issue #66: Save to Tracker form state
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveStage, setSaveStage] = useState('Saved')
  const [saveNote, setSaveNote] = useState('')
  const [saveResult, setSaveResult] = useState(null)

  function handleSave() {
    if (!onSaveToTracker) return

    const result = onSaveToTracker({
      stage: saveStage,
      note: saveNote,
    })

    setSaveResult(result ?? {
      ok: false,
      message: 'Unable to save this job.',
    })

    if (result?.ok) {
      setShowSaveForm(false)
      setSaveStage('Saved')
      setSaveNote('')
    }
  }

  function handleCancelSave() {
    setShowSaveForm(false)
    setSaveStage('Saved')
    setSaveNote('')
    setSaveResult(null)
  }

  const backLink = <a className="job-back" href="#/jobs">Back to jobs</a>

  if (status === 'loading') {
    return <section className="job-details">{backLink}<p role="status">Loading job…</p></section>
  }

  if (status === 'error') {
    return (
      <section className="job-details">
        {backLink}
        <div className="browse-state" role="alert">
          <h1>We couldn’t load this job</h1>
          <p>Please try again in a moment.</p>
          {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
        </div>
      </section>
    )
  }

  if (!job) {
    return <section className="job-details">{backLink}<h1>Job not found</h1><p>This listing is no longer available.</p></section>
  }

  const applicationHref = getApplicationHref(job.applicationUrl)
  const actionsUnavailable = !onSaveToTracker || (!matchResource && !onOpenAnalysis) || !onOpenDiscussion

  return (
    <section className="job-details" aria-labelledby="job-title">
      {backLink}

      <header className="job-detail-heading">
        {job.logoUrl && <img src={job.logoUrl} alt="" width="56" height="56" />}
        <div>
          <h1 id="job-title">{job.title}</h1>
          <p className="job-company">{job.company}</p>
          <p className="job-location">{job.location}{job.term ? ` · ${job.term}` : ''}</p>
        </div>
      </header>

      <dl className="job-metadata">
        <div><dt>Deadline</dt><dd>{formatJobDate(job.deadline) ?? 'Not listed'}</dd></div>
        <div><dt>Posted</dt><dd>{formatJobDate(job.postedAt) ?? 'Not listed'}</dd></div>
        <div><dt>Work authorization</dt><dd>{job.workAuthorization || formatSponsorship(job.sponsorsVisa)}</dd></div>
        <div><dt>Pay</dt><dd>{job.pay || 'Not listed'}</dd></div>
      </dl>

      <div className="job-actions">
        <button
          type="button"
          onClick={() => {
            setShowSaveForm(true)
            setSaveResult(null)
          }}
          disabled={!onSaveToTracker}
          aria-describedby={actionsUnavailable ? 'job-action-availability' : undefined}
        >
          Save to Tracker
        </button>

        {applicationHref ? (
          <a href={applicationHref} target="_blank" rel="noopener noreferrer">
            Apply on Company Site
          </a>
        ) : <p>Application link unavailable</p>}
      </div>

      {/* Issue #66: Choose stage and note before saving */}
      {showSaveForm && (
        <section className="job-content" aria-labelledby="save-tracker-title">
          <h2 id="save-tracker-title">Save to Tracker</h2>

          <label htmlFor="save-tracker-stage">Application Stage</label>
          <select
            id="save-tracker-stage"
            value={saveStage}
            onChange={(event) => setSaveStage(event.target.value)}
          >
            <option value="Saved">Saved</option>
            <option value="Preparing">Preparing</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Offer">Offer</option>
          </select>

          <label htmlFor="save-tracker-note">Optional Note</label>
          <textarea
            id="save-tracker-note"
            value={saveNote}
            onChange={(event) => setSaveNote(event.target.value)}
            placeholder="Add a note about this application"
            rows={4}
          />

          <div className="job-actions">
            <button type="button" onClick={handleSave}>
              Save
            </button>

            <button type="button" onClick={handleCancelSave}>
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* Issue #66: Save result and Tracker navigation */}
      {saveResult && (
        <div role="status">
          <p>{saveResult.message}</p>

          {saveResult.ok && (
            <a href="#/tracker">View Tracker</a>
          )}
        </div>
      )}

      {actionsUnavailable && (
        <p className="job-action-note" id="job-action-availability">
          Some actions aren’t available yet. Unavailable actions are disabled.
        </p>
      )}

      {matchResource ? (
        <JobMatch
          job={job}
          resource={matchResource}
          onRetry={onMatchRetry}
          onCompleteProfile={onCompleteProfile}
        />
      ) : (
        <section className="job-match-section" aria-labelledby="job-match-title">
          <div className="job-section-heading">
            <h2 id="job-match-title">AI Match</h2>
            <span className="job-match">
              {job.matchScore == null ? 'Match not available' : `${job.matchScore}% match`}
            </span>
          </div>

          <p>{job.matchSummary || 'A match summary is not available for this listing.'}</p>

          <button
            type="button"
            className="job-text-action"
            onClick={onOpenAnalysis}
            disabled={!onOpenAnalysis}
          >
            See full analysis
          </button>
        </section>
      )}

      <section className="job-content" aria-labelledby="job-description-title">
        <h2 id="job-description-title">About the Role</h2>
        {job.description?.length
          ? job.description.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          : <p>A description is not available for this listing.</p>}
      </section>

      <section className="job-content" aria-labelledby="job-requirements-title">
        <h2 id="job-requirements-title">Requirements</h2>
        {job.requirements?.length
          ? <ul>{job.requirements.map((requirement, index) => <li key={index}>{requirement}</li>)}</ul>
          : <p>Requirements are not listed.</p>}
      </section>

      <section className="job-content" aria-labelledby="job-discussion-title">
        <h2 id="job-discussion-title">Discussion</h2>
        <p>Compare interview timelines and application experiences with other applicants.</p>

        <button
          type="button"
          className="job-text-action"
          onClick={onOpenDiscussion}
          disabled={!onOpenDiscussion}
        >
          View discussion
        </button>
      </section>
    </section>
  )
}
