import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

let server
let origin
const originalFetch = globalThis.fetch

before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: null },
    logLevel: 'silent',
  })
  await server.listen()
  origin = server.resolvedUrls.local[0]
  globalThis.fetch = (url, options) => originalFetch(new URL(url, origin), options)
})
after(async () => {
  globalThis.fetch = originalFetch
  await server?.close()
})

test('the mock API and data access agree on all listings and selected job identity', async () => {
  await assert.doesNotReject(async () => {
    const { getJobs, getJob } = await server.ssrLoadModule('/src/jobs/api.js')
    const jobs = await getJobs()
    assert.ok(jobs.length > 4)
    assert.equal(new Set(jobs.map((job) => job.id)).size, jobs.length)
    for (const summary of [jobs[0], jobs.at(-1)]) {
      const detail = await getJob(summary.id)
      assert.equal(detail.id, summary.id)
      assert.equal(detail.title, summary.title)
      assert.ok(detail.description.length > 0)
      assert.ok(detail.requirements.length > 0)
      assert.match(detail.logoUrl, /^https:\/\/picsum\.photos\//)
    }
    assert.equal(await getJob('does-not-exist'), null)
  })
})

test('the mock endpoint returns JSON errors and never accepts writes', async () => {
  const missing = await fetch('/api/jobs/does-not-exist')
  assert.equal(missing.status, 404)
  assert.match(missing.headers.get('content-type'), /application\/json/)
  const write = await fetch('/api/jobs', { method: 'POST' })
  assert.equal(write.status, 405)
})

test('malformed or duplicate records fail before they reach the UI', async () => {
  const { getJobs, getJob } = await server.ssrLoadModule('/src/jobs/api.js')
  const transport = globalThis.fetch
  const job = { id: 'one', title: 'Intern', company: 'Example', location: 'New York' }
  try {
    for (const data of [[{ ...job, pay: {} }], [{ ...job, matchScore: 101 }],
      [{ ...job, sponsorsVisa: 'yes' }], [job, job]]) {
      globalThis.fetch = async () => new Response(JSON.stringify(data), { status: 200 })
      await assert.rejects(getJobs, /Invalid job/)
    }
    globalThis.fetch = async () => new Response(JSON.stringify(job), { status: 200 })
    await assert.rejects(() => getJob('other'), /identity/)
    globalThis.fetch = async () => new Response('Server failed', { status: 503 })
    await assert.rejects(getJobs, /Could not load jobs/)
  } finally {
    globalThis.fetch = transport
  }
})

test('job type accepts unknown strings and legacy values, but rejects malformed supplied values', async () => {
  const { getJobs } = await server.ssrLoadModule('/src/jobs/api.js')
  const transport = globalThis.fetch
  const job = { id: 'one', title: 'Intern', company: 'Example', location: 'New York' }
  try {
    for (const record of [job, { ...job, jobType: null }, { ...job, jobType: 'contract' }]) {
      globalThis.fetch = async () => new Response(JSON.stringify([record]), { status: 200 })
      assert.deepEqual(await getJobs(), [record])
    }
    for (const jobType of [{}, '', '   ', 7]) {
      globalThis.fetch = async () => new Response(JSON.stringify([{ ...job, jobType }]), { status: 200 })
      await assert.rejects(getJobs, /Invalid job/)
    }
  } finally {
    globalThis.fetch = transport
  }
})

test('one shared feed includes internships and entry-level records with matching detail identities', async () => {
  const { getJobs, getJob } = await server.ssrLoadModule('/src/jobs/api.js')
  const { filterJobs } = await server.ssrLoadModule('/src/jobs/browse.js')
  const jobs = await getJobs()
  assert.equal(jobs.length, 9)
  assert.equal(new Set(jobs.map((job) => job.id)).size, 9)
  const entries = jobs.filter((job) => job.jobType === 'entry-level')
  assert.deepEqual(entries.map((job) => job.id),
    ['brightspace-frontend-entry', 'hathaway-analyst-entry', 'northstar-quality-entry'])
  const base = { sponsorsOnly: false, deadlineDays: null }
  assert.equal(filterJobs(jobs, { ...base, jobTypes: [] }, '2026-11-02').length, 9)
  assert.equal(filterJobs(jobs, { ...base, jobTypes: ['internship'] }, '2026-11-02').length, 6)
  assert.equal(filterJobs(jobs, { ...base, jobTypes: ['entry-level'] }, '2026-11-02').length, 3)
  assert.equal(filterJobs(jobs, { ...base, jobTypes: ['internship', 'entry-level'] }, '2026-11-02').length, 9)
  assert.deepEqual(filterJobs(jobs, { jobTypes: ['entry-level'], sponsorsOnly: true, deadlineDays: 7 }, '2026-11-02')
    .map((job) => job.id), ['brightspace-frontend-entry'])
  for (const summary of entries) {
    const detail = await getJob(summary.id)
    assert.deepEqual(detail, summary)
    assert.ok(detail.description.length && detail.requirements.length)
    assert.equal(detail.term, undefined, 'Full-time roles must not inherit an internship term')
    assert.match(detail.logoUrl, /^https:\/\/picsum\.photos\//)
    assert.equal(new URL(detail.applicationUrl).searchParams.get('job'), detail.id)
  }
})
