import { useEffect, useId, useRef, useState } from 'react'
import './JobMatch.css'

export default function JobMatch({ job, resource, onRetry, onCompleteProfile }) {
  // Changing jobs resets the local popup; same-job resource updates stay visible inside it.
  return <MatchSummary key={job.id} job={job} resource={resource} onRetry={onRetry} onCompleteProfile={onCompleteProfile} />
}

function MatchSummary({ job, resource, onRetry, onCompleteProfile }) {
  const titleId = useId()
  const triggerRef = useRef(null)
  const summaryRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const data = resource.status === 'ready' && resource.data?.jobId === job.id ? resource.data : null

  return (
    <>
      <section ref={summaryRef} tabIndex={-1} className="job-match-section job-match-summary" aria-labelledby={titleId}>
        <div className="job-section-heading">
          <h2 id={titleId}>AI Match</h2>
          {data && <span className="job-match">{scoreLabel(data.score)}</span>}
        </div>
        {data ? (
          <>
            <p>{data.summary || 'A match summary is not available for this listing.'}</p>
            <button ref={triggerRef} type="button" className="job-text-action" onClick={() => setIsOpen(true)}>See full analysis</button>
          </>
        ) : <MatchState resource={resource} onRetry={onRetry} onCompleteProfile={onCompleteProfile} />}
      </section>
      {isOpen && (
        <MatchAnalysis job={job} resource={resource} data={data} onRetry={onRetry}
          onCompleteProfile={onCompleteProfile} triggerRef={triggerRef} summaryRef={summaryRef} onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}

function scoreLabel(score) {
  return score == null ? 'Match not available' : `${score}% match`
}

function MatchState({ resource, onRetry, onCompleteProfile }) {
  if (resource.status === 'loading') return <p role="status">Loading match analysis…</p>
  if (resource.status === 'incomplete-profile') {
    return (
      <div role="status">
        <p>{resource.message || 'We need your profile information to show a match analysis.'}</p>
        {onCompleteProfile && <button type="button" className="ui-button ui-button-secondary" onClick={onCompleteProfile}>Complete profile</button>}
      </div>
    )
  }
  return (
    <div role="alert">
      <p>{resource.status === 'error' ? resource.message || 'Match analysis could not be loaded.' : 'Match analysis is not available for this job.'}</p>
      {onRetry && <button type="button" className="ui-button ui-button-secondary" onClick={onRetry}>Try again</button>}
    </div>
  )
}

function MatchAnalysis({ job, resource, data, onRetry, onCompleteProfile, triggerRef, summaryRef, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    const summary = summaryRef.current
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      // eslint-disable-next-line react-hooks/exhaustive-deps -- Recovery can replace the same-job trigger before cleanup.
      const focusTarget = triggerRef.current || summary
      if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true })
    }
  }, [triggerRef, summaryRef])

  return (
    <dialog className="job-match-dialog" ref={dialogRef} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }}>
      <div className="match-popup">
        <header className="match-popup-header">
          <h2 id={titleId}>AI Match Analysis</h2>
          <button type="button" className="ui-button ui-button-secondary" onClick={onClose} aria-label="Close match analysis">Close</button>
        </header>
        <div className="match-popup-body">
          <p className="match-job-identity"><strong>{job.title}</strong><span>{job.company}</span></p>
          {data ? (
            <>
              <p className="match-score">{scoreLabel(data.score)}</p>
              <p>{data.summary || 'A match summary is not available for this listing.'}</p>
              <section>
                <h3>Why it could be a good fit</h3>
                {data.fitExplanation.length
                  ? <ul>{data.fitExplanation.map((text, index) => <li key={index}>{text}</li>)}</ul>
                  : <p>No fit explanation listed.</p>}
              </section>
              <section>
                <h3>Skills you may be missing</h3>
                {data.missingSkills.length
                  ? <ul className="match-skill-chips">{data.missingSkills.map((text, index) => <li key={index}>{text}</li>)}</ul>
                  : <p>No missing skills listed.</p>}
              </section>
              <section>
                <h3>Key qualifications</h3>
                {data.keyQualifications.length
                  ? <ul>{data.keyQualifications.map((text, index) => <li key={index}>{text}</li>)}</ul>
                  : <p>No key qualifications listed.</p>}
              </section>
              <p className="match-ai-notice">AI-generated summary. Check the full listing before applying.</p>
            </>
          ) : <MatchState resource={resource} onRetry={onRetry} onCompleteProfile={onCompleteProfile} />}
        </div>
        <footer className="match-popup-footer">
          <button type="button" className="ui-button" onClick={onClose}>Got It</button>
        </footer>
      </div>
    </dialog>
  )
}
