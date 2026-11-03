import './BrowseJobs.css'
import { formatJobDate, formatSponsorship } from '../jobs/formatters.js'

function JobCard({ job, getJobHref }) {
  const deadline = formatJobDate(job.deadline)
  const sponsorship = formatSponsorship(job.sponsorsVisa)

  return (
    <li>
      <a className="job-card" href={getJobHref(job.id)}>
        <div className="job-card-heading">
          {job.logoUrl && (
            <img src={job.logoUrl} alt="" width="44" height="44" loading="lazy" />
          )}
          <div>
            <h2>{job.title}</h2>
            <p className="job-company">{job.company}</p>
            <p className="job-location">
              {job.location}{job.term ? ` · ${job.term}` : ''}
            </p>
          </div>
        </div>
        <div className="job-card-facts">
          <span className="job-match">
            {job.matchScore == null ? 'Match not available' : `${job.matchScore}% match`}
          </span>
          <span>{sponsorship}</span>
          {deadline
            ? <time dateTime={job.deadline}>Due {deadline}</time>
            : <span>Deadline not listed</span>}
        </div>
      </a>
    </li>
  )
}

export default function BrowseJobs({ jobs = [], status = 'ready', onRetry, getJobHref }) {
  return (
    <section className="browse-jobs" aria-labelledby="browse-jobs-title">
      <header className="browse-heading">
        <h1 id="browse-jobs-title">Browse Jobs</h1>
        {status === 'ready' && jobs.length > 0 && (
          <p>{jobs.length === 1 ? '1 opportunity' : `${jobs.length} opportunities`}</p>
        )}
      </header>

      {status === 'loading' ? (
        <div className="browse-loading" role="status" aria-busy="true">
          <p>Loading opportunities…</p>
          <div aria-hidden="true"><span /><span /><span /></div>
        </div>
      ) : status === 'error' ? (
        <div className="browse-state" role="alert">
          <h2>We couldn’t load jobs</h2>
          <p>Please try again in a moment.</p>
          {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
        </div>
      ) : jobs.length === 0 ? (
        <div className="browse-state">
          <h2>No opportunities yet</h2>
          <p>Check back soon for new listings.</p>
        </div>
      ) : (
        <ul className="job-list">
          {jobs.map((job) => <JobCard key={job.id} job={job} getJobHref={getJobHref} />)}
        </ul>
      )}
    </section>
  )
}
