import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { act, createElement, StrictMode } from 'react'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const jobs = Array.from({ length: 6 }, (_, index) => ({
  id: `intern-${index}`, title: `Engineering Intern ${index}`, company: `Company ${index}`,
  location: 'New York, NY', term: 'Summer 2027', deadline: '2026-11-13',
  postedAt: '2026-10-01', pay: '$30 / hour', sponsorsVisa: true, matchScore: 80,
  workAuthorization: 'Sponsorship available.', matchSummary: 'A match for the demo profile.',
  applicationUrl: `https://example.com/?job=intern-${index}`,
  description: [`Description for job ${index}.`], requirements: ['JavaScript experience.'],
}))
const originalFetch = globalThis.fetch
let server
let dom
let root
let App

function response(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function serveJobs(url) {
  const path = String(url)
  if (path === '/api/jobs') return Promise.resolve(response(jobs))
  const job = jobs.find((item) => path === `/api/jobs/${item.id}`)
  return Promise.resolve(job ? response(job) : response({ error: 'Not found' }, 404))
}

before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { middlewareMode: true, hmr: false, watch: null },
    logLevel: 'silent',
  })
  ;({ default: App } = await server.ssrLoadModule('/src/App.jsx'))
})

beforeEach(async () => {
  dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/#/jobs' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  dom.window.scrollTo = () => {}
  globalThis.fetch = serveJobs
  const { createRoot } = await import('react-dom/client')
  root = createRoot(document.getElementById('root'))
})

afterEach(async () => {
  await act(async () => root.unmount())
  dom.window.close()
  globalThis.fetch = originalFetch
  delete globalThis.window
  delete globalThis.document
  delete globalThis.IS_REACT_ACT_ENVIRONMENT
})
after(async () => { await server?.close() })

async function tick() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

async function waitFor(check) {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (check()) return
    await act(tick)
  }
  assert.fail(`Expected UI did not appear. Current page: ${document.body.textContent}`)
}

async function mount() {
  await act(async () => root.render(createElement(StrictMode, null, createElement(App))))
}

async function click(element) {
  assert.ok(element, 'Expected a real clickable element')
  await act(async () => { element.click(); await tick() })
}

test('Browse opens the sixth job, returns to the list, and opens a different job', async () => {
  await mount()
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
  await click(document.querySelectorAll('.job-card')[5])
  await waitFor(() => document.querySelector('h1')?.textContent === jobs[5].title)
  assert.ok(document.body.textContent.includes(jobs[5].description[0]))
  assert.equal(document.querySelector('a[target="_blank"]').href, jobs[5].applicationUrl)
  await click(document.querySelector('a[href="#/jobs"]'))
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
  await click(document.querySelector('.job-card'))
  await waitFor(() => document.querySelector('h1')?.textContent === jobs[0].title)
  assert.ok(!document.body.textContent.includes(jobs[5].description[0]))
})

test('a failed list request exposes retry and can recover to real results', async () => {
  let rejectRequest
  globalThis.fetch = () => new Promise((resolve, reject) => { rejectRequest = reject })
  await mount()
  assert.match(document.body.textContent, /Loading opportunities/)
  await act(async () => rejectRequest(new Error('Network down')))
  await waitFor(() => Boolean(document.querySelector('[role="alert"]')))
  globalThis.fetch = serveJobs
  await click(document.querySelector('[role="alert"] button'))
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
})

test('empty feeds and missing details have visible states with a way back', async () => {
  globalThis.fetch = () => Promise.resolve(response([]))
  await mount()
  await waitFor(() => document.body.textContent.includes('No opportunities yet'))
  assert.equal(document.querySelectorAll('.job-card').length, 0)
  globalThis.fetch = serveJobs
  await act(async () => { window.location.hash = '#/jobs/missing'; await tick() })
  await waitFor(() => document.body.textContent.includes('Job not found'))
  assert.ok(document.querySelector('a[href="#/jobs"]'))
})

test('late detail responses cannot replace the currently selected job', async () => {
  let resolveOld
  globalThis.fetch = (url) => String(url) === '/api/jobs/intern-0'
    ? new Promise((resolve) => { resolveOld = resolve }) : serveJobs(url)
  await mount()
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
  await click(document.querySelector('.job-card'))
  await waitFor(() => Boolean(resolveOld))
  await act(async () => { window.location.hash = '#/jobs/intern-1'; await tick() })
  await waitFor(() => document.querySelector('h1')?.textContent === jobs[1].title)
  await act(async () => resolveOld(response(jobs[0])))
  assert.equal(document.querySelector('h1').textContent, jobs[1].title)
})

test('hash navigation supports history back and invalid routes recover safely', async () => {
  await mount()
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
  await click(document.querySelector('.job-card'))
  await waitFor(() => document.querySelector('h1')?.textContent === jobs[0].title)
  await act(async () => { window.history.back(); await tick() })
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
  await act(async () => { window.location.hash = '#/jobs/%'; await tick() })
  await waitFor(() => document.body.textContent.includes('Page not found'))
  assert.ok(document.querySelector('a[href="#/jobs"]'))
})

for (const navigation of ['link', 'history']) {
  test(`returning by ${navigation} restores the loaded list without waiting for another request`, async () => {
    await mount()
    await waitFor(() => document.querySelectorAll('.job-card').length === 6)
    await click(document.querySelector('.job-card'))
    await waitFor(() => document.querySelector('h1')?.textContent === jobs[0].title)
    let returnRequests = 0
    globalThis.fetch = (url) => {
      if (String(url) === '/api/jobs') {
        returnRequests++
        return new Promise(() => {})
      }
      return serveJobs(url)
    }
    if (navigation === 'link') {
      await click(document.querySelector('a[href="#/jobs"]'))
    } else {
      await act(async () => { window.history.back(); await tick() })
    }
    await waitFor(() => document.querySelectorAll('.job-card').length === 6)
    assert.equal(returnRequests, 0, 'Returning to a loaded Browse view should reuse its data')
  })
}

test('an active request abort exposes retry instead of leaving the page loading', async () => {
  globalThis.fetch = async () => { throw new DOMException('Request cancelled', 'AbortError') }
  await mount()
  await waitFor(() => Boolean(document.querySelector('[role="alert"] button')))
  globalThis.fetch = serveJobs
  await click(document.querySelector('[role="alert"] button'))
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
})

test('retrying details does not invalidate the previously loaded Browse list', async () => {
  let failDetails = true
  globalThis.fetch = (url) => {
    if (String(url) === '/api/jobs/intern-0' && failDetails) {
      return Promise.resolve(response({ error: 'Unavailable' }, 503))
    }
    return serveJobs(url)
  }
  await mount()
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
  await click(document.querySelector('.job-card'))
  await waitFor(() => Boolean(document.querySelector('[role="alert"] button')))
  failDetails = false
  await click(document.querySelector('[role="alert"] button'))
  await waitFor(() => document.querySelector('h1')?.textContent === jobs[0].title)
  globalThis.fetch = () => new Promise(() => {})
  await click(document.querySelector('a[href="#/jobs"]'))
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
})
