import './BrowseJobs.css'
import { useId, useState } from 'react'
import { formatJobDate, formatSponsorship } from '../jobs/formatters.js'
import { DEADLINES, DEFAULT_FILTERS, JOB_TYPES, filterJobs, searchJobs, sortJobs } from '../jobs/browse.js'
import JobFilters from './JobFilters.jsx'

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

export default function BrowseJobs({
  jobs = [], status = 'ready', onRetry, getJobHref, filters = DEFAULT_FILTERS, onFiltersChange, profile,
  query = '', onQueryChange, sort = 'best-match', onSortChange,
}) {
  const controlId = useId()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const visibleJobs = sortJobs(searchJobs(filterJobs(jobs, filters), query), sort)
  const chips = filters.jobTypes.map((value) => ({
    key: `type-${value}`, label: JOB_TYPES.find((type) => type.value === value)?.label ?? value,
    remove: () => onFiltersChange({ ...filters, jobTypes: filters.jobTypes.filter((type) => type !== value) }),
  }))
  if (filters.sponsorsOnly) chips.push({
    key: 'sponsorship', label: 'Sponsors visas', remove: () => onFiltersChange({ ...filters, sponsorsOnly: false }),
  })
  if (filters.deadlineDays !== null) chips.push({
    key: 'deadline', label: DEADLINES.find((choice) => choice.value === filters.deadlineDays)?.label ?? 'Deadline',
    remove: () => onFiltersChange({ ...filters, deadlineDays: null }),
  })

  return (
    <section className="browse-jobs" aria-labelledby="browse-jobs-title">
      <header className="browse-heading">
        <h1 id="browse-jobs-title">Browse Jobs</h1>
        {status === 'ready' && (
          <p role="status">{visibleJobs.length === 1 ? '1 opportunity' : `${visibleJobs.length} opportunities`}</p>
        )}
      </header>

      {status === 'ready' && (onFiltersChange || onQueryChange || onSortChange) && (
        <div className="browse-controls">
          {onQueryChange && (
            <div className="browse-search">
              <label htmlFor={`${controlId}-search`}>Search jobs</label>
              <div className="browse-search-row">
                <input className="ui-field" id={`${controlId}-search`} type="search" aria-label="Search jobs"
                  placeholder="Search title, company, or skill" value={query}
                  onChange={(event) => onQueryChange(event.target.value)} />
                {query && <button type="button" className="ui-button ui-button-secondary"
                  aria-label="Clear search" onClick={() => onQueryChange('')}>Clear search</button>}
              </div>
            </div>
          )}
          <div className="browse-control-row">
            {onFiltersChange && <button type="button" className="ui-button ui-button-secondary" aria-haspopup="dialog"
              aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}>Filters</button>}
            {onSortChange && (
              <div className="browse-sort">
                <label htmlFor={`${controlId}-sort`}>Sort jobs</label>
                <select className="ui-field" id={`${controlId}-sort`} aria-label="Sort jobs" value={sort}
                  onChange={(event) => onSortChange(event.target.value)}>
                  <option value="best-match">Best match</option>
                  <option value="deadline">Deadline soonest</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            )}
          </div>
          {onFiltersChange && chips.length > 0 && (
            <div className="filter-chips" aria-label="Applied filters">
              {chips.map((chip) => (
                <button type="button" className="filter-chip" key={chip.key}
                  aria-label={`Remove ${chip.label} filter`} onClick={chip.remove}>
                  {chip.label}<span aria-hidden="true"> ×</span>
                </button>
              ))}
              <button type="button" className="ui-button ui-button-secondary" onClick={() => onFiltersChange(DEFAULT_FILTERS)}>Clear all</button>
            </div>
          )}
          {onFiltersChange && filtersOpen && <JobFilters filters={filters} onFiltersChange={onFiltersChange}
            resultCount={visibleJobs.length} onClose={() => setFiltersOpen(false)} />}
        </div>
      )}

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
      ) : visibleJobs.length === 0 ? (
        <div className="browse-state">
          <h2>No matching opportunities</h2>
          <p>{query.trim() ? 'Try another search or clear search to see more jobs.' : 'Remove a filter or clear all filters to see more jobs.'}</p>
        </div>
      ) : (
        <>
          {profile && <p>Recommended from your saved skills: {profile.skills.join(', ')}</p>}
          <ul className="job-list">
            {visibleJobs.map((job) => <JobCard key={job.id} job={job} getJobHref={getJobHref} />)}
          </ul>
        </>
      )}
    </section>
  )
}
