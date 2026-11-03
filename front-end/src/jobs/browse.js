export const DEFAULT_FILTERS = Object.freeze({ jobTypes: Object.freeze([]), sponsorsOnly: false, deadlineDays: null })

export const JOB_TYPES = [
  { value: 'internship', label: 'Internship' },
  { value: 'entry-level', label: 'Full-time entry-level' },
]

export const DEADLINES = [
  { value: null, label: 'Any time' },
  { value: 7, label: 'Within 7 days' },
  { value: 30, label: 'Within 30 days' },
]

function calendarDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN
  const time = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN
}

export function filterJobs(jobs, filters = DEFAULT_FILTERS, todayISO = new Date().toISOString().slice(0, 10)) {
  const { jobTypes = [], sponsorsOnly = false, deadlineDays = null } = filters
  const start = calendarDay(todayISO)
  const end = start + deadlineDays * 86400000
  return jobs.filter((job) => {
    if (jobTypes.length && !jobTypes.includes(job.jobType)) return false
    if (sponsorsOnly && job.sponsorsVisa !== true) return false
    if (deadlineDays !== null) {
      const deadline = calendarDay(job.deadline)
      if (!(deadline >= start && deadline <= end)) return false
    }
    return true
  })
}
