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
let AppState
let BrowseJobs

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
  ;({ default: AppState } = await server.ssrLoadModule('/src/data/AppState.jsx'))
  ;({ default: BrowseJobs } = await server.ssrLoadModule('/src/pages/BrowseJobs.jsx'))
})

beforeEach(async (context) => {
  context.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-11-02T12:00:00Z') })
  dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/#/jobs' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  dom.window.scrollTo = () => {}
  // jsdom does not implement native modal behavior; real focus/inertness is checked in Chromium.
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
  globalThis.fetch = serveJobs
  const { createRoot } = await import('react-dom/client')
  root = createRoot(document.getElementById('root'))
})

afterEach(async (context) => {
  await act(async () => root.unmount())
  dom.window.close()
  globalThis.fetch = originalFetch
  delete globalThis.window
  delete globalThis.document
  delete globalThis.IS_REACT_ACT_ENVIRONMENT
  context.mock.timers.reset()
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
  await act(async () => root.render(createElement(StrictMode, null, createElement(AppState, null, createElement(App)))))
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
  globalThis.fetch = (url) => String(url) === '/api/jobs'
    ? new Promise((resolve, reject) => { rejectRequest = reject }) : serveJobs(url)
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

const filterJobs = jobs.map((job, index) => ({
  ...job, jobType: index === 5 ? 'entry-level' : 'internship',
  sponsorsVisa: index % 2 === 0, deadline: index === 0 ? '2026-11-09' : '2026-11-13',
}))

function serveFilterJobs(url) {
  const path = String(url)
  const job = filterJobs.find((item) => path === `/api/jobs/${item.id}`)
  return Promise.resolve(response(path === '/api/jobs' ? filterJobs : job))
}

function buttonNamed(name) {
  const button = [...document.querySelectorAll('button')].find((item) => item.textContent === name)
  assert.ok(button, `Expected button: ${name}`)
  return button
}

function checkboxNamed(name) {
  const label = [...document.querySelectorAll('label')].find((item) => item.textContent === name)
  assert.ok(label?.querySelector('input[type="checkbox"]'), `Expected checkbox: ${name}`)
  return label.querySelector('input')
}

test('filters combine, show live counts and removable chips, and clear without refetching', async () => {
  globalThis.fetch = serveFilterJobs
  await mount()
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
  await click(buttonNamed('Filters'))
  assert.ok(document.querySelector('dialog[open]'))
  assert.equal(document.body.style.overflow, 'hidden')
  await click(checkboxNamed('Internship'))
  await click(checkboxNamed('Only show roles that sponsor visas'))
  assert.equal(document.querySelectorAll('.job-card').length, 3)
  const deadline = document.querySelector('dialog select')
  await act(async () => {
    deadline.value = '7'
    deadline.dispatchEvent(new window.Event('change', { bubbles: true }))
  })
  assert.equal(document.querySelectorAll('.job-card').length, 1)
  await click(buttonNamed('Show 1 Result'))
  assert.equal(document.querySelector('dialog'), null)
  assert.equal(document.body.style.overflow, '')
  globalThis.fetch = () => { throw new Error('Filtering must not refetch') }
  await click(document.querySelector('button[aria-label="Remove Within 7 days filter"]'))
  assert.equal(document.querySelectorAll('.job-card').length, 3)
  await click(buttonNamed('Clear all'))
  assert.equal(document.querySelectorAll('.job-card').length, 6)
})

for (const navigation of ['link', 'history']) {
  test(`filter selections and the full source feed survive Details and ${navigation} Back`, async () => {
    globalThis.fetch = serveFilterJobs
    await mount()
    await waitFor(() => document.querySelectorAll('.job-card').length === 6)
    await click(buttonNamed('Filters'))
    await click(checkboxNamed('Full-time entry-level'))
    await click(buttonNamed('Show 1 Result'))
    await click(document.querySelector('.job-card'))
    await waitFor(() => document.querySelector('h1')?.textContent === jobs[5].title)
    if (navigation === 'link') await click(document.querySelector('a.job-back'))
    else await act(async () => { window.history.back(); await tick() })
    await waitFor(() => document.querySelectorAll('.job-card').length === 1)
    assert.equal(document.querySelector('.job-card h2').textContent, jobs[5].title)
    await click(buttonNamed('Clear all'))
    assert.equal(document.querySelectorAll('.job-card').length, 6)
  })
}

test('no filtered matches is distinct from an empty feed and the sheet closes with zero results', async () => {
  globalThis.fetch = serveFilterJobs
  await mount()
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
  await click(buttonNamed('Filters'))
  await click(checkboxNamed('Full-time entry-level'))
  await click(checkboxNamed('Only show roles that sponsor visas'))
  assert.match(document.body.textContent, /No matching opportunities/)
  assert.match(document.body.textContent, /0 opportunities/)
  assert.doesNotMatch(document.body.textContent, /No opportunities yet/)
  await click(buttonNamed('Show 0 Results'))
  assert.equal(document.querySelector('dialog'), null)
  await click(buttonNamed('Clear all'))
  assert.equal(document.querySelectorAll('.job-card').length, 6)
})

test('cancel closes the sheet, restores page scroll, and preserves live selections', async () => {
  globalThis.fetch = serveFilterJobs
  await mount()
  await waitFor(() => document.querySelectorAll('.job-card').length === 6)
  await click(buttonNamed('Filters'))
  await click(checkboxNamed('Full-time entry-level'))
  await act(async () => document.querySelector('dialog').dispatchEvent(new window.Event('cancel', { cancelable: true })))
  assert.equal(document.querySelector('dialog'), null)
  assert.equal(document.body.style.overflow, '')
  assert.equal(document.querySelectorAll('.job-card').length, 1)
  await click(buttonNamed('Filters'))
  assert.equal(checkboxNamed('Full-time entry-level').checked, true)
  await click(document.querySelector('button[aria-label="Close filters"]'))
  assert.equal(document.querySelector('dialog'), null)
})

test('the actual mixed fixture feed filters by type and opens different entry-level jobs without losing selections', async () => {
  const { readFile } = await import('node:fs/promises')
  const records = JSON.parse(await readFile(new URL('../mocks/jobs.json', import.meta.url), 'utf8'))
  globalThis.fetch = (url) => {
    const path = String(url)
    const job = records.find((item) => path === `/api/jobs/${item.id}`)
    return Promise.resolve(response(path === '/api/jobs' ? records : job))
  }
  await mount()
  await waitFor(() => document.querySelectorAll('.job-card').length === records.length)
  await click(buttonNamed('Filters'))
  await click(checkboxNamed('Full-time entry-level'))
  assert.equal(document.querySelectorAll('.job-card').length, 3)
  await click(checkboxNamed('Only show roles that sponsor visas'))
  const deadline = document.querySelector('dialog select')
  await act(async () => {
    deadline.value = '7'
    deadline.dispatchEvent(new window.Event('change', { bubbles: true }))
  })
  assert.equal(document.querySelectorAll('.job-card').length, 1)
  await click(buttonNamed('Show 1 Result'))
  await click(document.querySelector('.job-card'))
  await waitFor(() => document.querySelector('h1')?.textContent === 'Frontend Engineer')
  assert.equal(new URL(document.querySelector('a[target="_blank"]').href).searchParams.get('job'), 'brightspace-frontend-entry')
  assert.doesNotMatch(document.body.textContent, /Summer 2027/)
  await click(document.querySelector('a.job-back'))
  await waitFor(() => document.querySelectorAll('.job-card').length === 1)
  await click(document.querySelector('button[aria-label="Remove Sponsors visas filter"]'))
  await click(document.querySelector('button[aria-label="Remove Within 7 days filter"]'))
  assert.equal(document.querySelectorAll('.job-card').length, 3)
  await click(document.querySelector('a[href="#/jobs/northstar-quality-entry"]'))
  await waitFor(() => document.querySelector('h1')?.textContent === 'Quality Engineer')
  assert.match(document.body.textContent, /Not listed/)
  await act(async () => { window.history.back(); await tick() })
  await waitFor(() => document.querySelectorAll('.job-card').length === 3)
  await click(buttonNamed('Clear all'))
  assert.equal(document.querySelectorAll('.job-card').length, 9)
})

const searchRecords = jobs.slice(0, 4).map((job, index) => ({
  ...job, jobType: index === 1 ? 'entry-level' : 'internship',
  matchScore: [0, 90, 90, null][index], sponsorsVisa: index !== 2,
  requirements: [index === 3 ? 'Vue experience' : 'React experience'],
  deadline: ['2026-11-09', '2026-11-06', '2026-11-04', null][index],
  postedAt: ['2026-10-03', '2026-10-01', '2026-10-02', null][index],
}))

function serveSearchJobs(url) {
  const path = String(url)
  return Promise.resolve(response(path === '/api/jobs' ? searchRecords : searchRecords.find((job) => path === `/api/jobs/${job.id}`)))
}

function cardIds() {
  return [...document.querySelectorAll('.job-card')].map((card) => card.getAttribute('href').split('/').at(-1))
}

async function enterSearch(value) {
  const input = document.querySelector('input[aria-label="Search jobs"]')
  assert.ok(input, 'Expected the Search jobs input')
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value)
    input.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
}

async function chooseSort(value) {
  const select = document.querySelector('select[aria-label="Sort jobs"]')
  assert.ok(select, 'Expected the Sort jobs select')
  await act(async () => {
    select.value = value
    select.dispatchEvent(new window.Event('change', { bubbles: true }))
  })
}

test('typing and clearing search updates immediately and each sort reorders the same cached matches', async () => {
  globalThis.fetch = serveSearchJobs
  await mount()
  await waitFor(() => document.querySelectorAll('.job-card').length === 4)
  assert.deepEqual(cardIds(), ['intern-1', 'intern-2', 'intern-0', 'intern-3'])
  globalThis.fetch = () => { throw new Error('Search and sort must not refetch') }
  await enterSearch(' rEaCt ')
  assert.deepEqual(cardIds(), ['intern-1', 'intern-2', 'intern-0'])
  await chooseSort('deadline')
  assert.deepEqual(cardIds(), ['intern-2', 'intern-1', 'intern-0'])
  await chooseSort('newest')
  assert.deepEqual(cardIds(), ['intern-0', 'intern-2', 'intern-1'])
  await chooseSort('best-match')
  assert.deepEqual(cardIds(), ['intern-1', 'intern-2', 'intern-0'])
  await enterSearch('no such role')
  assert.deepEqual(cardIds(), [])
  assert.match(document.body.textContent, /0 opportunities|No matching opportunities/)
  await click(document.querySelector('button[aria-label="Clear search"]'))
  assert.equal(document.querySelector('input[aria-label="Search jobs"]').value, '')
  assert.deepEqual(cardIds(), ['intern-1', 'intern-2', 'intern-0', 'intern-3'])
})

test('query and all filters share counts while clearing search or filters preserves the other controls', async () => {
  globalThis.fetch = serveSearchJobs
  await mount()
  await waitFor(() => document.querySelectorAll('.job-card').length === 4)
  await enterSearch('React')
  await chooseSort('newest')
  await click(buttonNamed('Filters'))
  await click(checkboxNamed('Internship'))
  await click(checkboxNamed('Only show roles that sponsor visas'))
  const deadline = document.querySelector('dialog select')
  await act(async () => {
    deadline.value = '7'
    deadline.dispatchEvent(new window.Event('change', { bubbles: true }))
  })
  assert.deepEqual(cardIds(), ['intern-0'])
  await click(buttonNamed('Show 1 Result'))
  await click(buttonNamed('Filters'))
  assert.equal(checkboxNamed('Internship').checked, true)
  assert.equal(document.querySelector('dialog select').value, '7')
  await click(buttonNamed('Show 1 Result'))
  await click(document.querySelector('button[aria-label="Clear search"]'))
  assert.deepEqual(cardIds(), ['intern-0'])
  assert.equal(document.querySelector('select[aria-label="Sort jobs"]').value, 'newest')
  await enterSearch('Vue')
  assert.deepEqual(cardIds(), [])
  await click(buttonNamed('Filters'))
  await click(buttonNamed('Show 0 Results'))
  await click(buttonNamed('Clear all'))
  assert.deepEqual(cardIds(), ['intern-3'])
  assert.equal(document.querySelector('input[aria-label="Search jobs"]').value, 'Vue')
  assert.equal(document.querySelector('select[aria-label="Sort jobs"]').value, 'newest')
  await enterSearch('   ')
  assert.deepEqual(cardIds(), ['intern-0', 'intern-2', 'intern-1', 'intern-3'])
})

for (const navigation of ['link', 'history']) {
  test(`search, sort, matching IDs and selected identity survive Details and ${navigation} Back without refetching`, async () => {
    let listRequests = 0
    globalThis.fetch = (url) => {
      if (String(url) === '/api/jobs') listRequests++
      return serveSearchJobs(url)
    }
    await mount()
    await waitFor(() => document.querySelectorAll('.job-card').length === 4)
    await enterSearch('React')
    await chooseSort('deadline')
    await click(buttonNamed('Filters'))
    await click(checkboxNamed('Internship'))
    await click(buttonNamed('Show 2 Results'))
    const requestsBeforeDetails = listRequests
    await click(document.querySelector('.job-card'))
    await waitFor(() => document.querySelector('h1')?.textContent === jobs[2].title)
    assert.equal(new URL(document.querySelector('a[target="_blank"]').href).searchParams.get('job'), 'intern-2')
    if (navigation === 'link') await click(document.querySelector('a.job-back'))
    else await act(async () => { window.history.back(); await tick() })
    await waitFor(() => document.querySelectorAll('.job-card').length === 2)
    assert.deepEqual(cardIds(), ['intern-2', 'intern-0'])
    assert.equal(document.querySelector('input[aria-label="Search jobs"]').value, 'React')
    assert.equal(document.querySelector('select[aria-label="Sort jobs"]').value, 'deadline')
    assert.ok(document.querySelector('button[aria-label="Remove Internship filter"]'))
    assert.equal(listRequests, requestsBeforeDetails)
  })
}

test('search with read-only filters hides filter actions and removes an open sheet when its callback is withdrawn', async () => {
  let query = ''
  let onFiltersChange
  function renderBrowse() {
    root.render(createElement(BrowseJobs, {
      jobs: searchRecords,
      filters: { jobTypes: ['internship'], sponsorsOnly: false, deadlineDays: null },
      getJobHref: (id) => `#/jobs/${id}`,
      query,
      onQueryChange: (value) => { query = value; renderBrowse() },
      onFiltersChange,
    }))
  }

  await act(async () => renderBrowse())
  assert.equal(Boolean(document.querySelector('.filter-chips')), false, 'Read-only filters must not expose removal actions')
  assert.equal(Boolean(document.querySelector('button[aria-haspopup="dialog"]')), false)
  await enterSearch('React')
  assert.deepEqual(cardIds(), ['intern-2', 'intern-0'])
  await click(document.querySelector('button[aria-label="Clear search"]'))
  assert.deepEqual(cardIds(), ['intern-2', 'intern-0', 'intern-3'])

  onFiltersChange = () => {}
  await act(async () => renderBrowse())
  await click(buttonNamed('Filters'))
  assert.ok(document.querySelector('dialog[open]'))
  onFiltersChange = undefined
  await act(async () => renderBrowse())
  assert.equal(Boolean(document.querySelector('dialog')), false)
  assert.equal(Boolean(document.querySelector('.filter-chips')), false)
  assert.equal(document.body.style.overflow, '')
  await enterSearch('Vue')
  assert.deepEqual(cardIds(), ['intern-3'])
})

const locationRecords = searchRecords.map((job, index) => ({
  ...job, location: ['New York, NY', 'Boston, MA', 'new york, ny', 'Remote, United States'][index],
}))

for (const navigation of ['link', 'history']) {
  test(`locations combine with query and every filter, survive ${navigation} Back, and reset independently of query/sort`, async () => {
    const requests = []
    globalThis.fetch = (url, options) => {
      requests.push({ path: String(url), method: options?.method ?? 'GET' })
      return Promise.resolve(response(String(url) === '/api/jobs' ? locationRecords : locationRecords.find((job) => String(url) === `/api/jobs/${job.id}`)))
    }
    await mount()
    await waitFor(() => document.querySelectorAll('.job-card').length === 4)
    const initialListRequests = requests.filter(({ path }) => path === '/api/jobs').length
    const requestsAfterMount = requests.length
    await enterSearch('React')
    await chooseSort('newest')
    await click(buttonNamed('Filters'))
    const locationFieldset = [...document.querySelectorAll('fieldset')].find((item) => item.querySelector('legend')?.textContent === 'Location')
    assert.ok(locationFieldset, 'Expected the labelled Location fieldset')
    assert.deepEqual([...locationFieldset.querySelectorAll('label')].map((label) => label.textContent), ['Boston, MA', 'New York, NY', 'Remote, United States'])
    await click(checkboxNamed('New York, NY'))
    await click(checkboxNamed('Boston, MA'))
    assert.deepEqual(cardIds(), ['intern-0', 'intern-2', 'intern-1'])
    assert.ok(checkboxNamed('Remote, United States'), 'Choices come from the full feed even when search excludes a location')
    await click(checkboxNamed('Internship'))
    await click(checkboxNamed('Only show roles that sponsor visas'))
    await act(async () => {
      const deadline = document.querySelector('dialog select')
      deadline.value = '7'
      deadline.dispatchEvent(new window.Event('change', { bubbles: true }))
    })
    assert.deepEqual(cardIds(), ['intern-0'])
    await click(buttonNamed('Show 1 Result'))
    await click(document.querySelector('button[aria-label="Remove New York, NY filter"]'))
    assert.deepEqual(cardIds(), [])
    assert.match(document.body.textContent, /No matching opportunities/)
    assert.ok(document.querySelector('button[aria-label="Remove Boston, MA filter"]'))
    assert.ok(document.querySelector('button[aria-label="Remove Internship filter"]'))
    await click(buttonNamed('Filters'))
    assert.equal(checkboxNamed('Boston, MA').checked, true)
    assert.equal(checkboxNamed('New York, NY').checked, false)
    await click(buttonNamed('Show 0 Results'))
    await click(buttonNamed('Filters'))
    await click(checkboxNamed('New York, NY'))
    await click(buttonNamed('Show 1 Result'))
    await click(document.querySelector('.job-card'))
    await waitFor(() => document.querySelector('h1')?.textContent === jobs[0].title)
    if (navigation === 'link') await click(document.querySelector('a.job-back'))
    else await act(async () => { window.history.back(); await tick() })
    await waitFor(() => document.querySelectorAll('.job-card').length === 1)
    assert.deepEqual(cardIds(), ['intern-0'])
    assert.ok(document.querySelector('button[aria-label="Remove Boston, MA filter"]'))
    assert.ok(document.querySelector('button[aria-label="Remove New York, NY filter"]'))
    await click(buttonNamed('Clear all'))
    assert.deepEqual(cardIds(), ['intern-0', 'intern-2', 'intern-1'])
    assert.equal(document.querySelector('input[aria-label="Search jobs"]').value, 'React')
    assert.equal(document.querySelector('select[aria-label="Sort jobs"]').value, 'newest')
    await click(buttonNamed('Filters'))
    assert.ok([...document.querySelectorAll('dialog input[type="checkbox"]')].every((input) => !input.checked))
    assert.equal(document.querySelector('dialog select').value, '')
    assert.ok(requests.slice(requestsAfterMount).every(({ path, method }) => method === 'GET' && (path === '/api/jobs' || path === '/api/jobs/intern-0')), 'Location filtering makes no additional profile or mutation request after shared-state initialization')
    assert.equal(requests.filter(({ path }) => path === '/api/jobs').length, initialListRequests, 'Selection and navigation reuse the loaded feed')
  })
}

test('a selected location stays removable when a refreshed feed no longer includes it', async () => {
  let records = locationRecords
  let filters = { jobTypes: [], locations: ['New York, NY', 'Boston, MA'], sponsorsOnly: false, deadlineDays: null }
  function renderBrowse() {
    root.render(createElement(BrowseJobs, {
      jobs: records, filters, getJobHref: (id) => `#/jobs/${id}`,
      onFiltersChange: (value) => { filters = value; renderBrowse() },
    }))
  }
  await act(async () => renderBrowse())
  assert.equal(document.querySelectorAll('.job-card').length, 3)
  records = locationRecords.filter((job) => job.location === 'Remote, United States')
  await act(async () => renderBrowse())
  assert.deepEqual(cardIds(), [])
  assert.ok(document.querySelector('button[aria-label="Remove New York, NY filter"]'))
  await click(document.querySelector('button[aria-label="Remove New York, NY filter"]'))
  assert.deepEqual(filters.locations, ['Boston, MA'])
  assert.deepEqual(cardIds(), [])
  await click(buttonNamed('Filters'))
  await click(buttonNamed('Clear all'))
  assert.deepEqual(filters.locations, [])
  await click(buttonNamed('Show 1 Result'))
  assert.deepEqual(cardIds(), ['intern-3'])
})
