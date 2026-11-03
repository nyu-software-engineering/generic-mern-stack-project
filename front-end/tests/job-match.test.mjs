import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { act, createElement, Fragment, StrictMode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

let server
let JobMatch
let JobDetails
let dom
let root
before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { middlewareMode: true, hmr: false, watch: null },
    logLevel: 'silent',
  })
  const module = await server.ssrLoadModule('/src/pages/JobMatch.jsx').catch(() => null)
  JobMatch = module?.default
  ;({ default: JobDetails } = await server.ssrLoadModule('/src/pages/JobDetails.jsx'))
})
beforeEach(async () => {
  dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/#/jobs' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  // These stubs simulate DOM lifecycle only; native focus/inertness/scroll need real browsers.
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
  const { createRoot } = await import('react-dom/client')
  root = createRoot(document.getElementById('root'))
})
afterEach(async () => {
  await act(async () => root.unmount())
  dom.window.close()
  delete globalThis.window
  delete globalThis.document
  delete globalThis.IS_REACT_ACT_ENVIRONMENT
})
after(async () => { await server?.close() })

const job = {
  id: 'brightspace-intern', title: 'Software Engineering Intern', company: 'Brightspace Labs',
  matchScore: 99, matchSummary: 'Legacy result must not leak.',
}
const ready = {
  status: 'ready',
  data: {
    jobId: job.id, score: 72, summary: 'Your projects match the JavaScript skills.',
    fitExplanation: ['You have built a React project.'], missingSkills: ['Docker'],
    keyQualifications: ['Degree in progress', 'Git basics'],
  },
}

function render(resource = ready, props = {}) {
  assert.equal(typeof JobMatch, 'function', 'The controlled JobMatch component must exist')
  return renderToStaticMarkup(createElement(JobMatch, { job, resource, ...props }))
}

test('the supplied resource drives the summary and exposes a real analysis action', () => {
  const html = render()
  assert.match(html, /AI Match/)
  assert.match(html, /72% match/)
  assert.ok(html.includes(ready.data.summary))
  assert.match(html, /<button[^>]*>See full analysis<\/button>/)
  assert.doesNotMatch(html, /99%|Legacy result|<dialog/)
})

test('zero is a real score while null remains unknown', () => {
  assert.match(render({ ...ready, data: { ...ready.data, score: 0 } }), /0% match/)
  const html = render({ ...ready, data: { ...ready.data, score: null } })
  assert.match(html, /Match not available/)
  assert.doesNotMatch(html, /0% match/)
})

test('loading hides supplied and legacy scores and exposes a status', () => {
  const html = render({ status: 'loading', data: ready.data })
  assert.match(html, /role="status"/)
  assert.match(html, /Loading match analysis/)
  assert.doesNotMatch(html, /72%|99%|Legacy result|See full analysis|projects match/)
})

test('errors expose only an available retry action and escaped error text', () => {
  const resource = { status: 'error', message: '<b>Unavailable</b>', data: ready.data }
  const html = render(resource)
  assert.match(html, /role="alert"/)
  assert.match(html, /&lt;b&gt;Unavailable&lt;\/b&gt;/)
  assert.doesNotMatch(html, /Try again|<b>|72%|See full analysis/)
  assert.match(render(resource, { onRetry: () => {} }), /Try again/)
})

test('incomplete profile asks for information with navigation only when supplied', () => {
  const resource = { status: 'incomplete-profile', data: ready.data }
  assert.match(render(resource), /profile information/)
  assert.doesNotMatch(render(resource), /<button|72%|See full analysis/)
  assert.match(render(resource, { onCompleteProfile: () => {} }), />Complete profile<\/button>/)
})

test('a different job result is refused rather than presented as the selected match', () => {
  const html = render({ ...ready, data: { ...ready.data, jobId: 'other-job' } })
  assert.match(html, /not available for this job/)
  assert.doesNotMatch(html, /72%|projects match|See full analysis/)
})

test('summary text is plain text and an empty summary stays truthful', () => {
  assert.match(render({ ...ready, data: { ...ready.data, summary: '<img src=x onerror=bad()>' } }),
    /&lt;img src=x onerror=bad\(\)&gt;/)
  assert.match(render({ ...ready, data: { ...ready.data, summary: '' } }), /A match summary is not available/)
})

async function mount(resource = ready, props = {}, Component = JobMatch) {
  await act(async () => root.render(createElement(StrictMode, null,
    createElement(Component, { job, resource, ...props }))))
}

function button(name, container = document) {
  return [...container.querySelectorAll('button')].find((item) => item.textContent === name)
}

async function click(element) {
  assert.ok(element, 'Expected an available action')
  await act(async () => element.click())
}

async function open() {
  await click(button('See full analysis'))
  const dialog = document.querySelector('dialog[open]')
  assert.ok(dialog, 'See full analysis opens a native dialog')
  return dialog
}

test('the native dialog shows the supplied explanation, identity, skills and AI notice', async () => {
  await mount()
  const dialog = await open()
  const name = document.getElementById(dialog.getAttribute('aria-labelledby'))
  assert.equal(name.textContent, 'AI Match Analysis')
  for (const text of [job.title, job.company, '72% match', ready.data.summary,
    ...ready.data.fitExplanation, ...ready.data.missingSkills, ...ready.data.keyQualifications,
    'Why it could be a good fit', 'Skills you may be missing', 'Key qualifications',
    'AI-generated summary. Check the full listing before applying.']) {
    assert.ok(dialog.textContent.includes(text), text)
  }
  assert.ok(button('Close', dialog))
  assert.ok(button('Got It', dialog))
  assert.doesNotMatch(dialog.textContent, /Legacy result|99%/)
})

test('empty detail lists and unknown scores use truthful modal fallbacks', async () => {
  await mount({ ...ready, data: { ...ready.data, score: null, fitExplanation: [], missingSkills: [], keyQualifications: [] } })
  const dialog = await open()
  for (const text of ['Match not available', 'No fit explanation listed.', 'No missing skills listed.', 'No key qualifications listed.']) {
    assert.ok(dialog.textContent.includes(text), text)
  }
  assert.doesNotMatch(dialog.textContent, /0%|meet every|perfect match/i)
})

test('all supplied explanation text is escaped, including skills and selected identity', async () => {
  const text = '<img src=x onerror=bad()>'
  await mount({ ...ready, data: { ...ready.data, summary: text, fitExplanation: [text], missingSkills: [text], keyQualifications: [text] } },
    { job: { ...job, title: text, company: text } })
  const dialog = await open()
  assert.equal(dialog.querySelectorAll('img, script').length, 0)
  assert.equal(dialog.textContent.split(text).length - 1, 6)
})

for (const action of ['Close', 'Got It', 'Escape']) {
  test(`${action} closes the dialog and restores prior overflow and focus without scrolling`, async (context) => {
    await mount()
    document.body.style.overflow = 'scroll'
    const trigger = button('See full analysis')
    trigger.focus()
    const focus = context.mock.method(trigger, 'focus')
    const dialog = await open()
    assert.equal(document.body.style.overflow, 'hidden')
    if (action === 'Escape') {
      const event = new dom.window.Event('cancel', { cancelable: true })
      await act(async () => dialog.dispatchEvent(event))
      assert.equal(event.defaultPrevented, true)
    } else {
      await click(button(action, dialog))
    }
    assert.equal(document.querySelector('dialog'), null)
    assert.equal(dialog.open, false)
    assert.equal(document.body.style.overflow, 'scroll')
    assert.equal(document.activeElement, trigger)
    assert.deepEqual(focus.mock.calls.at(-1).arguments, [{ preventScroll: true }])
    assert.ok(document.body.textContent.includes(ready.data.summary))
  })
}

test('a backdrop click leaves the analysis open', async () => {
  await mount()
  const dialog = await open()
  await click(dialog)
  assert.equal(dialog.open, true)
  assert.equal(document.body.style.overflow, 'hidden')
})

test('unmount while open closes the native element and restores an existing overflow value', async (context) => {
  await mount()
  document.body.style.overflow = 'auto'
  const dialog = await open()
  const summary = document.querySelector('.job-match-summary')
  const focus = context.mock.method(summary, 'focus')
  await act(async () => root.render(null))
  assert.equal(dialog.open, false)
  assert.equal(document.body.style.overflow, 'auto')
  assert.equal(summary.isConnected, false)
  assert.equal(focus.mock.callCount(), 0)
})

test('error Retry and Complete profile dispatch only their supplied callbacks', async () => {
  let retries = 0
  let profiles = 0
  const props = { onRetry: () => retries++, onCompleteProfile: () => profiles++ }
  await mount({ status: 'error' }, props)
  await click(button('Try again'))
  assert.equal(retries, 1)
  assert.equal(profiles, 0)
  await mount({ status: 'incomplete-profile', message: 'Add your skills to continue.' }, props)
  assert.match(document.body.textContent, /Add your skills/)
  await click(button('Complete profile'))
  assert.equal(retries, 1)
  assert.equal(profiles, 1)
})

test('an open analysis follows same-job resources through recovery without stale content or cleanup', async () => {
  let retries = 0
  let profiles = 0
  const props = { onRetry: () => retries++, onCompleteProfile: () => profiles++ }
  await mount(ready, props)
  document.body.style.overflow = 'auto'
  const dialog = await open()
  for (const status of ['loading', 'error', 'incomplete-profile']) {
    await mount({ status, data: ready.data }, props)
    assert.equal(document.querySelector('dialog'), dialog)
    assert.equal(dialog.open, true)
    assert.doesNotMatch(dialog.textContent, /72%|projects match|React project|Docker|Legacy result/)
    assert.equal(document.body.style.overflow, 'hidden')
    if (status === 'error') await click(button('Try again', dialog))
    if (status === 'incomplete-profile') await click(button('Complete profile', dialog))
  }
  assert.equal(retries, 1)
  assert.equal(profiles, 1)
  await mount({ ...ready, data: { ...ready.data, score: 0, summary: 'Updated supplied result.' } }, props)
  assert.equal(document.querySelector('dialog'), dialog)
  assert.match(dialog.textContent, /0% match/)
  assert.match(dialog.textContent, /Updated supplied result/)
  assert.doesNotMatch(dialog.textContent, /72%|projects match/)
})

test('closing after same-job recovery restores focus to the current analysis trigger', async (context) => {
  await mount()
  document.body.style.overflow = 'auto'
  const originalTrigger = button('See full analysis')
  originalTrigger.focus()
  const dialog = await open()
  await mount({ status: 'loading' })
  await mount({ status: 'error' })
  await mount(ready)
  const currentTrigger = button('See full analysis')
  assert.equal(currentTrigger === originalTrigger, false)
  assert.equal(originalTrigger.isConnected, false)
  assert.equal(document.querySelector('dialog') === dialog, true)
  const focus = context.mock.method(currentTrigger, 'focus')
  const close = button('Close', dialog)
  close.focus()
  await click(close)
  assert.equal(document.activeElement === currentTrigger, true)
  assert.deepEqual(focus.mock.calls.at(-1).arguments, [{ preventScroll: true }])
  assert.equal(document.body.style.overflow, 'auto')
})

for (const { name, resource, recoveryProp, recoveryAction, closeAction } of [
  { name: 'error', resource: { status: 'error' }, recoveryProp: 'onRetry', recoveryAction: 'Try again', closeAction: 'Close' },
  { name: 'incomplete profile', resource: { status: 'incomplete-profile' }, recoveryProp: 'onCompleteProfile', recoveryAction: 'Complete profile', closeAction: 'Got It' },
  { name: 'loading', resource: { status: 'loading' }, closeAction: 'Escape' },
  { name: 'mismatched data', resource: { ...ready, data: { ...ready.data, jobId: 'wrong' } }, closeAction: 'Close' },
]) {
  test(`closing while ${name} restores focus to the current job summary without scrolling`, async (context) => {
    let recoveryCalls = 0
    const props = recoveryProp ? { [recoveryProp]: () => recoveryCalls++ } : {}
    await mount(ready, props)
    document.body.style.overflow = 'auto'
    const summary = document.querySelector('.job-match-summary')
    const trigger = button('See full analysis')
    trigger.focus()
    const dialog = await open()
    await mount(resource, props)
    assert.equal(trigger.isConnected, false)
    assert.equal(document.querySelector('.job-match-summary') === summary, true)
    const focus = context.mock.method(summary, 'focus')
    button('Close', dialog).focus()
    if (closeAction === 'Escape') {
      await act(async () => dialog.dispatchEvent(new dom.window.Event('cancel', { cancelable: true })))
    } else {
      await click(button(closeAction, dialog))
    }
    assert.equal(document.activeElement === summary, true)
    assert.equal(summary.tabIndex, -1)
    assert.deepEqual(focus.mock.calls.at(-1).arguments, [{ preventScroll: true }])
    assert.equal(document.querySelector('dialog'), null)
    assert.equal(document.body.style.overflow, 'auto')
    if (recoveryAction) {
      await click(button(recoveryAction, summary))
      assert.equal(recoveryCalls, 1)
    } else {
      assert.equal(summary.querySelector('button'), null)
    }
  })
}

test('a mismatched replacement cannot leak another job into an already open dialog', async () => {
  await mount()
  const dialog = await open()
  await mount({ ...ready, data: { ...ready.data, jobId: 'wrong', summary: 'Wrong job result.' } })
  assert.equal(document.querySelector('dialog'), dialog)
  assert.match(dialog.textContent, /not available for this job/)
  assert.doesNotMatch(dialog.textContent, /72%|Wrong job result|Docker|projects match/)
})

test('open-dialog recovery actions reflect omitted and replaced callbacks', async () => {
  let oldCalls = 0
  let newCalls = 0
  await mount(ready, { onRetry: () => oldCalls++ })
  const dialog = await open()
  await mount({ status: 'error' })
  assert.equal(button('Try again', dialog), undefined)
  await mount({ status: 'error' }, { onRetry: () => newCalls++ })
  await click(button('Try again', dialog))
  assert.equal(oldCalls, 0)
  assert.equal(newCalls, 1)
  await mount({ status: 'incomplete-profile' })
  assert.equal(button('Complete profile', dialog), undefined)
  await mount({ status: 'incomplete-profile' }, { onCompleteProfile: () => newCalls++ })
  await click(button('Complete profile', dialog))
  assert.equal(newCalls, 2)
})

test('changing the selected job closes the previous dialog and never opens one automatically', async (context) => {
  await mount()
  document.body.style.overflow = 'auto'
  const dialog = await open()
  const summary = document.querySelector('.job-match-summary')
  const focus = context.mock.method(summary, 'focus')
  const nextJob = { ...job, id: 'second-job', title: 'Second Job', company: 'Second Company' }
  await mount(ready, { job: nextJob })
  assert.equal(document.querySelector('dialog'), null)
  assert.equal(dialog.open, false)
  assert.equal(document.body.style.overflow, 'auto')
  assert.equal(summary.isConnected, false)
  assert.equal(focus.mock.callCount(), 0)
  assert.equal(document.activeElement === document.querySelector('.job-match-summary'), false)
  assert.doesNotMatch(document.body.textContent, /72%|projects match/)
  await mount({ ...ready, data: { ...ready.data, jobId: nextJob.id } }, { job: nextJob })
  assert.equal(document.querySelector('dialog'), null)
  const nextDialog = await open()
  assert.match(nextDialog.textContent, /Second Job/)
  assert.doesNotMatch(nextDialog.textContent, /Software Engineering Intern|Brightspace Labs/)
})

test('repeated match sections have unique accessible heading references', async () => {
  await act(async () => root.render(createElement(Fragment, null,
    createElement(JobMatch, { job, resource: ready }),
    createElement(JobMatch, { job: { ...job, id: 'other' }, resource: { status: 'loading' } }))))
  const sections = [...document.querySelectorAll('section[aria-labelledby]')]
  const ids = sections.map((section) => section.getAttribute('aria-labelledby'))
  assert.equal(new Set(ids).size, 2)
  for (const id of ids) assert.equal(document.getElementById(id).textContent, 'AI Match')
})

test('JobDetails composes the supplied match and binds recovery while preserving other actions', async () => {
  let retries = 0
  let profiles = 0
  let saves = 0
  let discussions = 0
  const props = { matchResource: ready, onMatchRetry: () => retries++,
    onCompleteProfile: () => profiles++,
    onSaveToTracker: () => saves++, onOpenDiscussion: () => discussions++ }
  await mount(ready, props, JobDetails)
  assert.doesNotMatch(document.body.textContent, /Some actions aren’t available|Legacy result|99%/)
  await click(button('Save to Tracker'))
  await click(button('View discussion'))
  assert.equal(saves, 1)
  assert.equal(discussions, 1)
  const dialog = await open()
  await mount(ready, { ...props, matchResource: { status: 'error' } }, JobDetails)
  assert.doesNotMatch(dialog.textContent, /72%/)
  await click(button('Try again', dialog))
  assert.equal(retries, 1)
  await mount(ready, { ...props, matchResource: { status: 'incomplete-profile' } }, JobDetails)
  await click(button('Complete profile', dialog))
  assert.equal(profiles, 1)
})

test('the legacy analysis handler remains usable when JobDetails has no match resource', async () => {
  let opens = 0
  await mount(ready, { onOpenAnalysis: () => opens++ }, JobDetails)
  await click(button('See full analysis'))
  assert.equal(opens, 1)
  assert.equal(document.querySelector('dialog'), null)
  assert.match(document.body.textContent, /99% match|Legacy result/)
})
