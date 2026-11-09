import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { act, createElement, StrictMode, useEffect } from 'react'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const fixture = name => JSON.parse(readFileSync(new URL(`../mocks/${name}.json`, import.meta.url)))
const profile = fixture('profile')
const applications = fixture('applications')
const posts = fixture('discussions')
const jobs = fixture('jobs')
const originalFetch = globalThis.fetch
let server, dom, root, App, AppState, useAppState, currentState
let requests, matchHandler, profileHandler
const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }
function match(jobId, saved = profile, changes = {}) {
  return { jobId, profileId: saved.id, profileRevision: saved.revision, score: 92,
    summary: `Mock result for saved skills: ${saved.skills.join(', ')}`,
    fitExplanation: ['A supplied fixture explanation.'], missingSkills: ['Git'], keyQualifications: ['A supplied qualification.'], ...changes }
}
function serve(url, options = {}) {
  const path = String(url)
  if (path === '/api/profile') return profileHandler()
  if (path === '/api/applications') return Promise.resolve(response(applications))
  if (path === '/api/discussions') return Promise.resolve(response(posts))
  if (path === '/api/jobs') return Promise.resolve(response(jobs))
  if (path.startsWith('/api/jobs/')) return Promise.resolve(response(jobs.find(job => path === `/api/jobs/${job.id}`) ?? null))
  if (path.startsWith('/api/matches/')) {
    const saved = options.body ? JSON.parse(options.body).profile : profile
    const request = { jobId: decodeURIComponent(path.slice('/api/matches/'.length)), profile: saved, options }
    requests.push(request)
    return matchHandler(request)
  }
  return Promise.resolve(response(null, 404))
}
before(async () => {
  server = await createServer({ root: fileURLToPath(new URL('../', import.meta.url)), server: { middlewareMode: true, hmr: false, watch: null }, logLevel: 'silent' })
  ;({ default: App } = await server.ssrLoadModule('/src/App.jsx'))
  ;({ default: AppState } = await server.ssrLoadModule('/src/data/AppState.jsx'))
  ;({ useAppState } = await server.ssrLoadModule('/src/data/useAppState.js'))
})
beforeEach(async () => {
  dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/#/jobs' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  dom.window.scrollTo = () => {}
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
  requests = []
  profileHandler = () => Promise.resolve(response(profile))
  matchHandler = request => Promise.resolve(response(match(request.jobId, request.profile)))
  globalThis.fetch = serve
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
after(async () => { await server.close() })
const tick = () => new Promise(resolve => setTimeout(resolve, 0))
async function waitFor(check) {
  for (let attempt = 0; attempt < 60; attempt++) { if (check()) return; await act(tick) }
  assert.fail(`Expected UI/state did not appear: ${document.body.textContent}`)
}
function Capture() {
  const state = useAppState()
  useEffect(() => { currentState = state }, [state])
  return null
}
async function mount(route = '/jobs') {
  window.history.replaceState(null, '', `#${route}`)
  await act(async () => root.render(createElement(StrictMode, null, createElement(AppState, null, createElement(Capture), createElement(App)))))
}
async function navigate(route) { await act(async () => { window.location.hash = `#${route}`; await tick() }) }
async function click(element) { assert.ok(element, 'Expected clickable control'); await act(async () => { element.click(); await tick() }) }
const button = text => Array.from(document.querySelectorAll('button')).find(item => item.textContent.trim() === text)
async function type(element, value, key) {
  assert.ok(element)
  await act(async () => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(element, value)
    element.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    if (key) element.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, bubbles: true }))
    await tick()
  })
}
const detailRoute = index => `/jobs/${encodeURIComponent(jobs[index].id)}`
const contains = text => document.body.textContent.includes(text)

test('match starts loading and a network failure is retryable without leaving a loading state', async () => {
  const pending = deferred()
  matchHandler = () => pending.promise
  await mount(detailRoute(0))
  await waitFor(() => requests.length === 1)
  assert.ok(contains('Loading match analysis'))
  await act(async () => pending.resolve(response({ error: 'offline' }, 503)))
  await waitFor(() => Boolean(button('Try again')))
  assert.ok(!contains('Loading match analysis'))
  const retry = deferred()
  matchHandler = () => retry.promise
  await click(button('Try again'))
  await waitFor(() => requests.length === 2)
  assert.ok(contains('Loading match analysis'))
  await act(async () => retry.resolve(response(match(jobs[0].id))))
  await waitFor(() => Boolean(button('See full analysis')))
  assert.equal(requests[1].options.method, 'POST')
  assert.equal(requests[1].profile.id, profile.id)
})

test('switching jobs aborts the previous match and hides its score until the new result arrives', async () => {
  const later = deferred()
  await mount(detailRoute(0))
  await waitFor(() => Boolean(button('See full analysis')))
  matchHandler = () => later.promise
  await navigate(detailRoute(1))
  await waitFor(() => requests.length === 2)
  assert.ok(contains('Loading match analysis'))
  assert.ok(!contains('Mock result for saved skills:'))
  assert.equal(requests[0].options.signal.aborted, true)
  await act(async () => later.resolve(response(match(jobs[1].id, profile, { summary: 'The second job result.' }))))
  await waitFor(() => contains('The second job result.'))
})

test('an obsolete old-job response cannot replace a newer job result', async () => {
  const old = deferred()
  matchHandler = () => old.promise
  await mount(detailRoute(0))
  await waitFor(() => requests.length === 1)
  matchHandler = request => Promise.resolve(response(match(request.jobId, request.profile, { summary: 'Current job result.' })))
  await navigate(detailRoute(1))
  await waitFor(() => contains('Current job result.'))
  await act(async () => old.resolve(response(match(jobs[0].id, profile, { summary: 'Obsolete job result.' }))))
  assert.ok(contains('Current job result.'))
  assert.ok(!contains('Obsolete job result.'))
})

test('Cancel preserves saved profile while Save refreshes analysis for its new revision', async () => {
  await mount(detailRoute(0))
  await waitFor(() => Boolean(button('See full analysis')))
  await navigate('/profile/edit')
  await waitFor(() => Boolean(document.querySelector('input[name="name"]')))
  await type(Array.from(document.querySelectorAll('label')).find(label => label.textContent.trim() === 'Skills')?.querySelector('input'), 'Git')
  const skillInput = Array.from(document.querySelectorAll('label')).find(label => label.textContent.trim() === 'Skills').querySelector('input')
  await act(async () => skillInput.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })))
  await click(button('Cancel'))
  assert.equal(currentState.profile.revision, profile.revision)
  assert.ok(!currentState.profile.skills.includes('Git'))
  await navigate('/profile/edit')
  await waitFor(() => Boolean(document.querySelector('input[name="name"]')))
  const input = Array.from(document.querySelectorAll('label')).find(label => label.textContent.trim() === 'Skills').querySelector('input')
  await type(input, 'Git')
  await act(async () => input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })))
  await click(button('Save Changes'))
  assert.ok(currentState.profile.skills.includes('Git'))
  await navigate(detailRoute(0))
  await waitFor(() => Boolean(button('See full analysis')))
  assert.equal(requests.at(-1).profile.revision, profile.revision + 1)
  assert.ok(contains('Mock result for saved skills: Python, JavaScript, SQL, React, Git'))
})

test('a late retry for an older profile cannot overwrite a saved-profile result', async () => {
  matchHandler = () => Promise.resolve(response(null, 503))
  await mount(detailRoute(0))
  await waitFor(() => Boolean(button('Try again')))
  const oldRetry = deferred()
  matchHandler = () => oldRetry.promise
  await click(button('Try again'))
  await waitFor(() => requests.length === 2)
  await act(async () => currentState.saveProfile({ ...profile, skills: [...profile.skills, 'Git'] }))
  const latest = deferred()
  // A profile update can start immediately; resolve the last request independently of its saved revision.
  matchHandler = () => latest.promise
  await navigate('/profile')
  await navigate(detailRoute(0))
  await waitFor(() => requests.at(-1).profile.revision === 2)
  await act(async () => latest.resolve(response(match(jobs[0].id, { ...profile, revision: 2, skills: [...profile.skills, 'Git'] }, { summary: 'Saved profile result.' }))))
  await waitFor(() => contains('Saved profile result.'))
  await act(async () => oldRetry.resolve(response(match(jobs[0].id, profile, { summary: 'Stale retry result.' }))))
  assert.ok(contains('Saved profile result.'))
  assert.ok(!contains('Stale retry result.'))
})

for (const [name, changes] of [
  ['another job', { jobId: 'other-job' }], ['another profile', { profileId: 'other-profile' }],
  ['old profile revision', { profileRevision: 0 }], ['invalid score', { score: 101 }],
  ['malformed details', { fitExplanation: null }],
]) {
  test(`a response for ${name} is rejected before rendering analysis`, async () => {
    matchHandler = request => Promise.resolve(response(match(request.jobId, request.profile, changes)))
    await mount(detailRoute(0))
    await waitFor(() => contains('Match analysis could not be loaded.'))
    assert.equal(button('See full analysis'), undefined)
  })
}

test('an incomplete profile offers real edit navigation without requesting a match', async () => {
  profileHandler = () => Promise.resolve(response({ ...profile, skills: [] }))
  await mount(detailRoute(0))
  await waitFor(() => Boolean(button('Complete profile')))
  assert.equal(requests.length, 0)
  await click(button('Complete profile'))
  await waitFor(() => contains('Edit Profile'))
  assert.equal(window.location.hash, '#/profile/edit')
})

test('missing startup profile shows the load error instead of an endless profile spinner', async () => {
  profileHandler = () => Promise.resolve(response(null, 404))
  await mount('/profile/edit')
  await waitFor(() => contains('Could not load CareerHive data.'))
  assert.ok(!contains('Loading profile'))
})

test('logout restores saved session records and clears Browse controls without a reload', async () => {
  await mount('/jobs')
  await waitFor(() => currentState.status === 'ready' && Boolean(document.querySelector('input[type="search"]')))
  await act(async () => {
    currentState.saveProfile({ ...profile, name: 'Edited session name' })
    currentState.updateApplication(applications[0].id, { note: 'Edited note' })
    currentState.addPost(jobs[0].id, { topic: 'Interview', body: 'Session post', anonymous: true })
  })
  await type(document.querySelector('input[type="search"]'), 'Brightspace')
  await click(button('Menu'))
  await click(Array.from(document.querySelectorAll('a,button')).find(item => item.textContent.trim() === 'Log Out'))
  await waitFor(() => window.location.hash === '#/welcome')
  assert.deepEqual(currentState.profile, profile)
  assert.deepEqual(currentState.applications, applications)
  assert.deepEqual(currentState.posts, posts)
  await navigate('/jobs')
  await waitFor(() => Boolean(document.querySelector('input[type="search"]')))
  assert.equal(document.querySelector('input[type="search"]').value, '')
})

test('a canceled StrictMode startup cannot overwrite a later saved session', async () => {
  const obsolete = deferred()
  let loads = 0
  profileHandler = () => ++loads === 1 ? obsolete.promise : Promise.resolve(response(profile))
  await mount('/profile')
  await waitFor(() => currentState.status === 'ready')
  await act(async () => currentState.saveProfile({ ...profile, name: 'Saved after startup' }))
  await act(async () => obsolete.resolve(response({ ...profile, name: 'Obsolete startup' })))
  assert.equal(currentState.profile.name, 'Saved after startup')
})

test('queued shared updates preserve earlier application changes and distinct posts', async () => {
  await mount('/profile')
  await waitFor(() => currentState.status === 'ready')
  await act(async () => {
    currentState.updateApplication(applications[0].id, { stage: 'Applied' })
    currentState.updateApplication(applications[0].id, { note: 'Keep the new stage' })
    currentState.addPost(jobs[0].id, { topic: 'Interview', body: 'First post', anonymous: false })
    currentState.addPost(jobs[0].id, { topic: 'Interview', body: 'Second post', anonymous: false })
  })
  const updated = currentState.applications.find(item => item.id === applications[0].id)
  assert.equal(updated.stage, 'Applied')
  assert.equal(updated.note, 'Keep the new stage')
  assert.equal(currentState.posts.length, posts.length + 2)
  assert.notEqual(currentState.posts[0].id, currentState.posts[1].id)
})

const roleInput = role => Array.from(document.querySelectorAll('label'))
  .find(label => label.textContent.trim() === role)?.querySelector('input[type="checkbox"]')

test('preferred role changes stay in the profile draft and Cancel preserves saved roles', async () => {
  await mount('/profile/edit')
  await waitFor(() => Boolean(document.querySelector('input[name="name"]')))
  assert.ok(roleInput('Internships'), 'Expected internship preference checkbox')
  assert.equal(roleInput('Internships').checked, true)
  assert.equal(roleInput('Full-time entry-level roles').checked, false)
  await click(roleInput('Full-time entry-level roles'))
  assert.equal(roleInput('Full-time entry-level roles').checked, true)
  assert.deepEqual(currentState.profile.lookingFor, profile.lookingFor)
  await click(button('Cancel'))
  assert.deepEqual(currentState.profile.lookingFor, profile.lookingFor)
  assert.equal(currentState.profile.revision, profile.revision)
  await navigate('/profile/edit')
  await waitFor(() => Boolean(document.querySelector('input[name="name"]')))
  assert.equal(roleInput('Full-time entry-level roles').checked, false)
})

test('saved role selections reopen correctly and can be cleared without changing other preferences', async () => {
  await mount('/profile/edit')
  await waitFor(() => Boolean(document.querySelector('input[name="name"]')))
  assert.ok(roleInput('Full-time entry-level roles'), 'Expected entry-level preference checkbox')
  await click(roleInput('Full-time entry-level roles'))
  await click(button('Save Changes'))
  assert.deepEqual(currentState.profile.lookingFor, ['Internships', 'Full-time entry-level roles'])
  assert.equal(currentState.profile.revision, profile.revision + 1)
  assert.deepEqual(currentState.profile.skills, profile.skills)
  assert.deepEqual(currentState.profile.locations, profile.locations)
  await navigate('/profile/edit')
  await waitFor(() => Boolean(document.querySelector('input[name="name"]')))
  assert.equal(roleInput('Internships').checked, true)
  assert.equal(roleInput('Full-time entry-level roles').checked, true)
  await click(roleInput('Internships'))
  await click(roleInput('Full-time entry-level roles'))
  await click(button('Save Changes'))
  assert.deepEqual(currentState.profile.lookingFor, [])
  assert.deepEqual(currentState.profile.skills, profile.skills)
  assert.deepEqual(currentState.profile.locations, profile.locations)
})
