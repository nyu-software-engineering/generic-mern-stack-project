import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { createApp } from '../../../back-end/app.js'
import { startTestServer } from '../../../back-end/test/helpers/server.js'
import { mockResponse } from '../fixtures.js'

// Optional browser check. See README.md for a temporary Playwright installation.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const root = process.env.FRONTEND_ROOT || fileURLToPath(new URL('../../', import.meta.url))
const data = mockResponse()
for (const rental of data.rentals) {
  rental.startDate = '2030-01-01'
  rental.endDate = '2030-01-03'
}
data.conversations[0].messages[0].text = 'reference'.repeat(100)
const api = await startTestServer(createApp({ store: { load: async () => data } }))
let vite
let browser
const failures = []
let steps = 0
let keyboardSteps = 0
const views = [
  ['/quick-borrow', '#itemName'],
  ['/listings/new', 'textarea[name="description"]'],
  ['/report', '#description'],
  ['/inbox?conversation=1', '#chat-message'],
  ['/listings/2/request', '#booking-start-date'],
  ['/bookings/113/review', '#reviewComment'],
]

try {
  vite = await createServer({ root, server: { host: '127.0.0.1', port: 0, proxy: { '/api': api.baseUrl } } })
  await vite.listen()
  const origin = `http://127.0.0.1:${vite.httpServer.address().port}`
  browser = await chromium.launch({ headless: true })

  for (const [width, height] of [[320, 500], [390, 500], [320, 203]]) {
    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()
    await page.goto(`${origin}/login`)
    await page.getByLabel('NYU email', { exact: true }).fill('focus-test@nyu.edu')
    await page.getByLabel('Password', { exact: true }).fill('fixture-password')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForURL('**/browse')

    for (const [path, ready] of views) {
      await page.evaluate(path => {
        history.pushState({}, '', path)
        dispatchEvent(new PopStateEvent('popstate'))
      }, path)
      await page.locator(ready).waitFor()
      await page.waitForLoadState('networkidle')
      const controls = []
      for (const control of await page.locator('main a[href], main button, main input, main select, main textarea').all()) {
        if (await control.isVisible() && await control.isEnabled() && await control.evaluate(node => node.tabIndex >= 0)) controls.push(control)
      }
      assert(controls.length, `No controls in ${path}`)

      for (const backward of [false, true]) {
        await page.evaluate(() => window.scrollTo(0, 0))
        await controls[backward ? controls.length - 1 : 0].focus()
        let leftMain = false
        for (let step = 0; step < 150; step += 1) {
          if (step) await page.keyboard.press(backward ? 'Shift+Tab' : 'Tab')
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)))
          const focused = await page.evaluate(() => {
            const node = document.activeElement
            if (!node?.closest('main')) return null
            const field = node.getBoundingClientRect()
            const bar = document.querySelector('.ds-mobile-nav').getBoundingClientRect()
            return {
              name: node.id || node.name || node.textContent.trim().slice(0, 40),
              top: field.top, bottom: field.bottom, barTop: bar.top,
              visibleHeight: Math.max(0, Math.min(field.bottom, bar.top) - Math.max(0, field.top)),
            }
          })
          if (!focused) { leftMain = true; break }
          steps += 1
          if (step) keyboardSteps += 1
          if (focused.visibleHeight === 0) failures.push({ path, width, height, backward, ...focused })
        }
        assert(leftMain, `Focus did not leave ${path}`)
      }
    }
    await context.close()
  }
  assert.equal(failures.length, 0, `Hidden focus: ${JSON.stringify(failures.slice(0, 4))}`)
  console.log(`Passed ${steps} focus observations, including ${keyboardSteps} native Tab or Shift+Tab observations, across six views and three viewport sizes.`)
} finally {
  await browser?.close()
  await vite?.close()
  await api.close()
}
