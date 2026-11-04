import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { act, createElement } from 'react'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const profile = { name: 'Alex Student', email: 'alex@example.com', photo: '/profile.jpg', skills: [] }
const originalFetch = globalThis.fetch
let server
let Menu
let AppState
let dom
let root
let trigger
let opened
let closed

before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { middlewareMode: true, hmr: false, watch: null },
    logLevel: 'silent',
  })
  ;({ default: Menu } = await server.ssrLoadModule('/src/components/Menu.jsx'))
  ;({ default: AppState } = await server.ssrLoadModule('/src/data/AppState.jsx'))
})

beforeEach(async () => {
  dom = new JSDOM('<button id="trigger">Menu</button><div id="root"></div>', { url: 'http://localhost/#/jobs' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  globalThis.fetch = async (url) => new Response(JSON.stringify(String(url) === '/api/profile' ? profile : []))
  opened = 0
  closed = 0
  // These stubs verify lifecycle dispatch only; real browsers verify modal focus/inertness.
  dom.window.HTMLDialogElement.prototype.showModal = function () { opened++; this.setAttribute('open', '') }
  dom.window.HTMLDialogElement.prototype.close = function () { closed++; this.removeAttribute('open') }
  const { createRoot } = await import('react-dom/client')
  root = createRoot(document.getElementById('root'))
  trigger = document.getElementById('trigger')
  trigger.focus()
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

async function mount(props = {}) {
  await act(async () => root.render(createElement(AppState, null, createElement(Menu, { onClose: () => {}, onLogOut: () => {}, ...props }))))
}

function menu() {
  const dialog = document.querySelector('dialog[open]')
  assert.ok(dialog, 'Menu must open as a native modal dialog')
  return dialog
}

async function click(element) {
  assert.ok(element, 'Expected an available menu action')
  await act(async () => element.click())
}

test('mount opens once, locks page scroll, and profile or callback updates do not reopen the dialog', async () => {
  document.body.style.overflow = 'scroll'
  await mount()
  assert.equal(menu().getAttribute('aria-label'), 'Menu')
  assert.equal(opened, 1)
  assert.equal(document.body.style.overflow, 'hidden')
  assert.match(menu().textContent, /Alex Student/)
  assert.match(menu().textContent, /alex@example.com/)
  await mount({ onClose: () => {} })
  assert.equal(opened, 1)
  assert.equal(closed, 0)
})

test('native Escape cancel prevents default and dispatches close exactly once', async () => {
  let dismissals = 0
  await mount({ onClose: () => { dismissals++ } })
  const event = new window.Event('cancel', { cancelable: true })
  await act(async () => menu().dispatchEvent(event))
  assert.equal(event.defaultPrevented, true)
  assert.equal(dismissals, 1)
})

test('Close and backdrop dismiss while panel and dialog interior clicks stay open', async () => {
  let dismissals = 0
  await mount({ onClose: () => { dismissals++ } })
  const dialog = menu()
  dialog.getBoundingClientRect = () => ({ left: 93, right: 393, top: 0, bottom: 852 })
  await click(dialog.querySelector('.menu-panel'))
  await act(async () => dialog.dispatchEvent(new window.MouseEvent('click', { bubbles: true, clientX: 200, clientY: 200 })))
  assert.equal(dismissals, 0)
  await click(dialog.querySelector('.menu-close'))
  assert.equal(dismissals, 1)
  await act(async () => dialog.dispatchEvent(new window.MouseEvent('click', { bubbles: true, clientX: 20, clientY: 200 })))
  assert.equal(dismissals, 2)
})

test('navigation keeps the existing routes and dispatches one close per link', async () => {
  let dismissals = 0
  await mount({ onClose: () => { dismissals++ } })
  const links = [...document.querySelectorAll('.menu-link:not(.menu-logout)')]
  assert.deepEqual(links.map((link) => [link.textContent, link.getAttribute('href')]), [
    ['Browse Jobs', '#/jobs'], ['My Tracker', '#/tracker'], ['My Profile', '#/profile'],
  ])
  for (const link of links) await click(link)
  assert.equal(dismissals, 3)
})

test('Log Out dispatches the parent logout once without also dispatching ordinary close', async () => {
  let dismissals = 0
  let logouts = 0
  await mount({ onClose: () => { dismissals++ }, onLogOut: () => { logouts++ } })
  const logout = document.querySelector('.menu-logout')
  assert.equal(logout.textContent, 'Log Out')
  await click(logout)
  assert.equal(logouts, 1)
  assert.equal(dismissals, 0)
})

for (const overflow of ['', 'auto', 'scroll']) {
  test(`unmount restores original ${overflow || 'empty'} overflow and Menu trigger focus without scrolling`, async (context) => {
    document.body.style.overflow = overflow
    const focus = context.mock.method(trigger, 'focus')
    await mount()
    const dialog = menu()
    dialog.querySelector('.menu-close').focus()
    await act(async () => root.render(null))
    assert.equal(dialog.open, false)
    assert.equal(closed, 1)
    assert.equal(document.body.style.overflow, overflow)
    assert.equal(document.activeElement, trigger)
    assert.deepEqual(focus.mock.calls.at(-1).arguments, [{ preventScroll: true }])
  })
}

test('cleanup skips a removed trigger safely', async (context) => {
  const focus = context.mock.method(trigger, 'focus')
  await mount()
  trigger.remove()
  await act(async () => root.render(null))
  assert.equal(focus.mock.callCount(), 0)
  assert.equal(document.body.style.overflow, '')
})

test('opening the menu places initial keyboard focus on Close', async () => {
  await mount()
  assert.equal(document.activeElement === menu().querySelector('.menu-close'), true)
})
