import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server

before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { middlewareMode: true, hmr: false, watch: null },
    logLevel: 'silent',
  })
})

after(async () => {
  await server?.close()
})

async function render(props) {
  const { default: BrowseJobs } = await server.ssrLoadModule('/src/pages/BrowseJobs.jsx')
  return renderToStaticMarkup(createElement(BrowseJobs, props))
}

const jobs = Array.from({ length: 6 }, (_, index) => ({
  id: `internship-${index}`,
  title: `Internship ${index}`,
  company: `Company ${index}`,
  location: 'New York, NY',
  term: 'Summer 2027',
  deadline: '2026-11-13',
  matchScore: index * 10,
  sponsorsVisa: index === 0 ? null : index % 2 === 0,
}))

test('every returned job is reachable through its own detail link', async () => {
  const requestedIds = []
  await assert.doesNotReject(async () => {
    const html = await render({
      jobs,
      getJobHref: (id) => {
        requestedIds.push(id)
        return `/job-details/${id}`
      },
    })
    assert.match(html, /6 opportunities/)
    for (const job of jobs) {
      assert.ok(html.includes(`href="/job-details/${job.id}"`))
      assert.ok(html.includes(job.title))
      assert.ok(html.includes(job.company))
    }
    assert.deepEqual(requestedIds, jobs.toReversed().map((job) => job.id))
  })
})

test('cards show zero match scores, dates, and distinct sponsorship states', async () => {
  const html = await render({ jobs, getJobHref: (id) => `/jobs/${id}` })
  assert.match(html, /0% match/)
  assert.match(html, /Due Nov 13/)
  assert.match(html, /Sponsors visas/)
  assert.match(html, /No visa sponsorship/)
  assert.match(html, /Sponsorship not listed/)
})

test('missing match and deadline information stays unknown', async () => {
  const html = await render({
    jobs: [{ ...jobs[0], matchScore: null, deadline: null }],
    getJobHref: (id) => `/jobs/${id}`,
  })
  assert.match(html, /1 opportunity</)
  assert.match(html, /Match not available/)
  assert.match(html, /Deadline not listed/)
  assert.doesNotMatch(html, /0% match|Invalid Date/)
})

test('loading and error states hide stale jobs and expose status or alert text', async () => {
  const loading = await render({ jobs, status: 'loading' })
  assert.match(loading, /role="status"/)
  assert.match(loading, /Loading opportunities/)
  assert.doesNotMatch(loading, /Internship 0/)

  const error = await render({ jobs, status: 'error', onRetry: () => {} })
  assert.match(error, /role="alert"/)
  assert.match(error, /Try again/)
  assert.doesNotMatch(error, /Internship 0/)
})

test('an empty feed displays a clear state with no fabricated cards', async () => {
  const html = await render({ jobs: [] })
  assert.match(html, /No opportunities yet/)
  assert.doesNotMatch(html, /href=/)
})

test('search and sort controls are labelled and the combined query/filter view renders in selected order', async () => {
  const html = await render({
    jobs: jobs.map((job, index) => ({ ...job, jobType: index < 3 ? 'internship' : 'entry-level' })),
    filters: { jobTypes: ['internship'], sponsorsOnly: false, deadlineDays: null },
    query: 'company', sort: 'best-match', onQueryChange: () => {}, onSortChange: () => {},
    getJobHref: (id) => `/jobs/${id}`,
  })
  assert.match(html, /aria-label="Search jobs"/)
  assert.match(html, /placeholder="Search title, company, or skill"/)
  assert.match(html, /aria-label="Sort jobs"/)
  assert.match(html, /aria-label="Clear search"/)
  assert.match(html, /3 opportunities/)
  assert.ok(html.indexOf('href="/jobs/internship-2"') < html.indexOf('href="/jobs/internship-0"'))
  assert.doesNotMatch(html, /href="\/jobs\/internship-3"/)
})

test('a query with no matches offers search recovery without claiming the feed is empty', async () => {
  const html = await render({ jobs, query: 'no such role', onQueryChange: () => {}, getJobHref: (id) => `/jobs/${id}` })
  assert.match(html, /0 opportunities/)
  assert.match(html, /No matching opportunities/)
  assert.match(html, /Clear search/)
  assert.doesNotMatch(html, /No opportunities yet|class="job-card"/)
})
