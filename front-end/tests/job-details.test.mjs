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
after(async () => { await server?.close() })

const job = {
  id: 'brightspace-intern', title: 'Software Engineering Intern',
  company: 'Brightspace Labs', location: 'New York, NY', term: 'Summer 2027',
  deadline: '2026-11-13', postedAt: '2026-10-01', pay: '$40–45 / hour',
  sponsorsVisa: true, workAuthorization: 'CPT/OPT accepted; sponsorship available.',
  matchScore: 92, matchSummary: 'Your demo profile matches the listed skills.',
  applicationUrl: 'https://example.com/?job=brightspace-intern',
  description: ['Build tools with a small engineering team.', 'Collaborate with design and product.'],
  requirements: ['Pursuing a degree in Computer Science.', 'Experience with JavaScript.'],
}

async function render(props) {
  const { default: JobDetails } = await server.ssrLoadModule('/src/pages/JobDetails.jsx')
  return renderToStaticMarkup(createElement(JobDetails, props))
}

test('the selected job exposes its complete metadata and safe company-site link', async () => {
  await assert.doesNotReject(async () => {
    const html = await render({ job })
    for (const text of [job.title, job.company, job.location, job.term, job.pay,
      job.workAuthorization, job.matchSummary, ...job.description, ...job.requirements]) {
      assert.ok(html.includes(text), text)
    }
    assert.match(html, /Nov 13, 2026/)
    assert.match(html, /Oct 1, 2026/)
    assert.match(html, /92% match/)
    assert.ok(html.includes(`href="${job.applicationUrl}"`))
    assert.match(html, /target="_blank"/)
    assert.match(html, /rel="noopener noreferrer"/)
    assert.match(html, /href="#\/jobs"/)
  })
})

test('future story entry points are visible but unavailable without working handlers', async () => {
  const html = await render({ job })
  assert.match(html, /disabled=""[^>]*>Save to Tracker/)
  assert.match(html, /disabled=""[^>]*>See full analysis/)
  assert.match(html, /disabled=""[^>]*>View discussion/)
  assert.doesNotMatch(html, /In Tracker:|Saved successfully/)
})

test('unsafe application URLs cannot become clickable links', async () => {
  const html = await render({ job: { ...job, applicationUrl: 'javascript:alert(1)' } })
  assert.doesNotMatch(html, /href="javascript:/)
  assert.match(html, /Application link unavailable/)
})

test('details loading, error, and missing-record states do not show a previous job', async () => {
  for (const status of ['loading', 'error']) {
    const html = await render({ job, status, onRetry: () => {} })
    assert.doesNotMatch(html, /Software Engineering Intern/)
    assert.match(html, status === 'loading' ? /role="status"/ : /role="alert"/)
  }
  const missing = await render({ job: null })
  assert.match(missing, /Job not found/)
  assert.match(missing, /Back to jobs/)
})
