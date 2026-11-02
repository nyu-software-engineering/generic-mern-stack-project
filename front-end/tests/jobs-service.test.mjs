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
