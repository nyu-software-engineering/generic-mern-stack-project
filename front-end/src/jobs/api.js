async function request(path, { signal } = {}) {
  const response = await fetch(path, { signal, headers: { Accept: 'application/json' } })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Could not load jobs')
  return response.json()
}

function validateJob(job) {
  if (!job || ['id', 'title', 'company', 'location'].some((key) => typeof job[key] !== 'string' || !job[key].trim())) {
    throw new Error('Invalid job response')
  }
  for (const key of ['term', 'logoUrl', 'deadline', 'postedAt', 'pay', 'workAuthorization', 'matchSummary', 'applicationUrl']) {
    if (job[key] != null && typeof job[key] !== 'string') throw new Error('Invalid job response')
  }
  if (job.matchScore != null && (!Number.isFinite(job.matchScore) || job.matchScore < 0 || job.matchScore > 100)) {
    throw new Error('Invalid job response')
  }
  if (job.sponsorsVisa != null && typeof job.sponsorsVisa !== 'boolean') throw new Error('Invalid job response')
  if (job.jobType != null && (typeof job.jobType !== 'string' || !job.jobType.trim())) {
    throw new Error('Invalid job response')
  }
  for (const key of ['description', 'requirements']) {
    if (job[key] != null && (!Array.isArray(job[key]) || job[key].some((item) => typeof item !== 'string'))) {
      throw new Error('Invalid job response')
    }
  }
  return job
}

export async function getJobs(options) {
  const jobs = await request('/api/jobs', options)
  if (!Array.isArray(jobs)) throw new Error('Invalid jobs response')
  const validJobs = jobs.map(validateJob)
  if (new Set(validJobs.map((job) => job.id)).size !== validJobs.length) throw new Error('Invalid job identifiers')
  return validJobs
}

export async function getJob(id, options) {
  const job = await request(`/api/jobs/${encodeURIComponent(id)}`, options)
  if (job === null) return null
  validateJob(job)
  if (job.id !== id) throw new Error('Job identity does not match the request')
  return job
}
