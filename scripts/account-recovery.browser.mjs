// Run after building front-end with PLAYWRIGHT_MODULE set to a Playwright entry point
// if Playwright is installed outside this project. Select a browser with PLAYWRIGHT_BROWSER.
// Set RECOVERY_BROWSER_EVIDENCE to a directory to save the blank password step.
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { env } from 'node:process'
import { test } from 'node:test'
import { createApp } from '../back-end/app.js'
import { mockData } from '../back-end/test/fixtures.js'

const engine = env.PLAYWRIGHT_BROWSER || 'chromium'
const playwright = await import(env.PLAYWRIGHT_MODULE || 'playwright')
assert.ok(playwright[engine]?.launch, `Unknown Playwright browser: ${engine}`)
const email = 'recovery-browser-fixture@nyu.edu'
const oldPassword = 'Synthetic-old-password'
const newPassword = 'Synthetic-new-password'
const minute = 60_000
const genericConfirmation = 'If an account exists for this email, password reset instructions will be sent.'

async function openFixture(t, { seedVerifiedAccount = true } = {}) {
  const messages = []
  const data = mockData()
  let now = Date.now()
  const app = createApp({
    store: { load: async () => data },
    recovery: { deliver: async (message) => { messages.push(message) }, now: () => now },
  })
  const server = app.listen(0, '127.0.0.1')
  t.after(() => new Promise((resolve) => server.close(resolve)))
  await once(server, 'listening')
  const origin = `http://127.0.0.1:${server.address().port}`

  async function api(path, body, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    if (body) headers['Content-Type'] = 'application/json'
    return fetch(`${origin}/api${path}`, {
      method: body ? 'POST' : 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  let user
  if (seedVerifiedAccount) {
    const signup = await api('/auth/signup', {
      fullName: 'Recovery Browser Fixture', email, password: oldPassword,
    })
    assert.equal(signup.status, 201)
    const { demoCode, user: registeredUser } = await signup.json()
    user = registeredUser
    const verification = await api('/auth/verify', { email, code: demoCode })
    assert.equal(verification.status, 200)
  }

  const browser = await playwright[engine].launch()
  t.after(() => browser.close())
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  page.setDefaultTimeout(4000)
  const browserErrors = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  t.after(() => assert.deepEqual(browserErrors, []))

  return {
    page, origin, api, user,
    async capturedMessages() {
      await app.locals.recovery.idle()
      return messages
    },
    advance(milliseconds) { now += milliseconds },
    async latestCode() {
      await app.locals.recovery.idle()
      const message = messages.findLast((item) => item.kind === 'password-reset')
      assert.ok(message, 'the capture adapter should receive a reset message')
      return message.code
    },
  }
}

async function requestCode(page, address = email) {
  await page.getByRole('heading', { name: 'Forgot your password?' }).waitFor()
  await page.getByLabel('NYU email').fill(address)
  const response = page.waitForResponse('**/api/auth/forgot-password')
  await page.getByRole('button', { name: 'Send reset code' }).click()
  assert.equal((await response).status(), 202)
  await page.getByText(genericConfirmation, { exact: true }).waitFor()
  await page.getByRole('link', { name: 'Enter reset code' }).click()
}

async function verifyCode(page, code) {
  await page.getByLabel('Reset code', { exact: true }).fill(code)
  const response = page.waitForResponse('**/api/auth/verify-reset-code')
  await page.getByRole('button', { name: 'Verify code' }).click()
  return response
}

async function assertFocusedError(page, field, message) {
  const error = page.getByRole('alert').filter({ hasText: message })
  await error.waitFor()
  assert.equal(await field.evaluate((input) => input === document.activeElement), true)
  assert.equal(await field.getAttribute('aria-invalid'), 'true')
  const descriptions = (await field.getAttribute('aria-describedby')).split(' ')
  assert.ok(descriptions.includes(await error.getAttribute('id')))
}

async function assertFits(page, submit) {
  const desktop = page.viewportSize()
  for (const width of [320, 390, 768, 1024, 1366]) {
    await page.setViewportSize({ width, height: width < 768 ? 420 : 768 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true,
      `page overflow at ${width}px`)
    await submit.scrollIntoViewIfNeeded()
    assert.equal(await submit.evaluate((button) => {
      const { x, y, width, height } = button.getBoundingClientRect()
      return button.contains(document.elementFromPoint(x + width / 2, y + height / 2))
    }), true, `submit button is reachable at ${width}px`)

    if (width === 320 && env.RECOVERY_BROWSER_EVIDENCE &&
        await page.getByLabel('New password', { exact: true }).count() === 1) {
      await mkdir(env.RECOVERY_BROWSER_EVIDENCE, { recursive: true })
      await page.screenshot({ path: join(env.RECOVERY_BROWSER_EVIDENCE, `new-password-${engine}-320.png`), fullPage: true })
    }
  }
  await page.setViewportSize(desktop)
}

async function signIn(page, password) {
  await page.getByRole('heading', { name: 'Sign in', exact: true }).waitFor()
  await page.getByLabel('NYU email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
}

test('recovers an existing account through captured mail and clears the active session', async (t) => {
  const { page, origin, api, user, latestCode } = await openFixture(t)
  await page.goto(`${origin}/login`)
  const signedIn = page.waitForResponse('**/api/auth/login')
  await signIn(page, oldPassword)
  const { token } = await (await signedIn).json()
  await page.waitForURL('**/setup-profile')

  await page.goBack()
  await page.waitForURL('**/login')
  await page.getByRole('button', { name: 'Sign out' }).waitFor()
  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await assertFits(page, page.getByRole('button', { name: 'Send reset code' }))
  await requestCode(page)
  await assertFits(page, page.getByRole('button', { name: 'Verify code' }))
  assert.equal(await page.getByLabel('NYU email').inputValue(), email)
  assert.equal(await page.getByLabel('New password', { exact: true }).count(), 0)
  const code = await latestCode()
  const codeField = page.getByLabel('Reset code', { exact: true })
  assert.equal(await codeField.getAttribute('type'), 'text')
  assert.equal(await codeField.getAttribute('inputmode'), 'numeric')
  assert.equal(await codeField.getAttribute('autocomplete'), 'one-time-code')
  const wrongCode = code === '00000000' ? '00000001' : '00000000'
  assert.equal((await verifyCode(page, wrongCode)).status(), 400)
  await assertFocusedError(page, codeField, /invalid or has expired/i)
  assert.equal((await codeField.inputValue()) === wrongCode, true)

  const verified = await verifyCode(page, code)
  assert.equal(verified.status(), 200)
  const { resetToken } = await verified.json()
  const password = page.getByLabel('New password', { exact: true })
  const confirmation = page.getByLabel('Confirm new password', { exact: true })
  await password.waitFor()
  assert.equal(await password.evaluate((field) => field === document.activeElement), true)
  assert.equal(await codeField.count(), 0)
  assert.equal(await page.evaluate(({ resetToken, code }) => {
    const artifacts = JSON.stringify({
      url: location.href,
      history: history.state,
      local: { ...localStorage },
      session: { ...sessionStorage },
    })
    return !artifacts.includes(resetToken) && !artifacts.includes(code)
  }, { resetToken, code }), true)
  await assertFits(page, page.getByRole('button', { name: 'Update password' }))
  for (const field of [password, confirmation]) {
    assert.equal(await field.getAttribute('autocomplete'), 'new-password')
    assert.equal(await field.getAttribute('minlength'), '8')
    assert.equal(await field.getAttribute('maxlength'), '128')
  }

  let resetCount = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/api/auth/reset-password')) resetCount += 1
  })
  await password.fill('short')
  await password.press('Enter')
  await assertFocusedError(page, password, 'Enter a password between 8 and 128 characters.')

  await password.fill(newPassword)
  await confirmation.fill('Synthetic-mismatched-password')
  await confirmation.press('Enter')
  await assertFocusedError(page, confirmation, 'Passwords must match.')
  assert.equal(resetCount, 0)

  await confirmation.fill(newPassword)
  await confirmation.press('Enter')
  await page.getByText('Password updated. Sign in with your new password.', { exact: true }).waitFor()
  assert.equal(resetCount, 1)
  assert.equal(await password.count(), 0)
  assert.equal(await page.getByRole('button', { name: 'Sign out' }).count(), 0)
  assert.equal((await api('/users/me', undefined, token)).status, 401)

  await page.getByRole('link', { name: 'Sign in' }).click()
  await signIn(page, oldPassword)
  await page.getByRole('alert').filter({ hasText: 'Invalid email or password.' }).waitFor()
  const newSignIn = page.waitForResponse('**/api/auth/login')
  await signIn(page, newPassword)
  const { user: recoveredUser } = await (await newSignIn).json()
  assert.equal(recoveredUser.id, user.id)
  await page.waitForURL('**/setup-profile')
})

test('a reset preserves the email verification path for an unverified signup', async (t) => {
  const { page, origin, api, latestCode } = await openFixture(t, { seedVerifiedAccount: false })
  await page.goto(`${origin}/signup`)
  await page.getByLabel('Full name').fill('Recovery Browser Fixture')
  await page.getByLabel('NYU email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(oldPassword)
  const signup = page.waitForResponse('**/api/auth/signup')
  await page.getByRole('button', { name: 'Create account' }).click()
  const created = await signup
  assert.equal(created.status(), 201)
  const { user, demoCode } = await created.json()
  assert.equal(user.emailVerified, false)

  const verificationHeading = page.getByRole('heading', { name: 'Verify your demo email' })
  await verificationHeading.waitFor()
  await page.getByRole('link', { name: 'Back', exact: true }).click()
  await page.getByRole('link', { name: 'Sign in instead' }).click()
  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await requestCode(page)
  await page.getByLabel('NYU email').fill(email.toUpperCase())
  assert.equal((await verifyCode(page, await latestCode())).status(), 200)

  await page.getByLabel('New password', { exact: true }).fill(newPassword)
  await page.getByLabel('Confirm new password', { exact: true }).fill(newPassword)
  await page.getByRole('button', { name: 'Update password' }).click()
  await page.getByRole('heading', { name: 'Password reset complete' }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Sign out' }).count(), 0)
  const unverifiedLogin = await api('/auth/login', { email, password: newPassword })
  assert.equal(unverifiedLogin.status, 403)
  assert.deepEqual(await unverifiedLogin.json(), { error: 'Verify your email first.' })

  await page.getByRole('link', { name: 'Continue email verification' }).click()
  await verificationHeading.waitFor()
  await page.reload()
  await verificationHeading.waitFor()
  await page.getByLabel('Verification code').fill(demoCode)
  const verification = page.waitForResponse('**/api/auth/verify')
  await page.getByRole('button', { name: 'Confirm demo code' }).click()
  assert.equal((await verification).status(), 200)
  await page.waitForURL('**/login')
  assert.equal(await page.getByRole('button', { name: 'Sign out' }).count(), 0)

  const rejectedLogin = page.waitForResponse('**/api/auth/login')
  await signIn(page, oldPassword)
  assert.equal((await rejectedLogin).status(), 401)
  await page.getByRole('alert').filter({ hasText: 'Invalid email or password.' }).waitFor()
  const newSignIn = page.waitForResponse('**/api/auth/login')
  await signIn(page, newPassword)
  const { user: recoveredUser } = await (await newSignIn).json()
  assert.equal(recoveredUser.id, user.id)
  assert.equal(recoveredUser.emailVerified, true)
  await page.waitForURL('**/setup-profile')
})

test('a late sign-in response leaves the password recovery page open', { timeout: 15000 }, async (t) => {
  const { page, origin } = await openFixture(t)
  await page.goto(`${origin}/login`)

  const submitted = Promise.withResolvers()
  const release = Promise.withResolvers()
  await page.route('**/api/auth/login', async (route) => {
    const response = await route.fetch()
    submitted.resolve(response.status())
    await release.promise
    await route.fulfill({ response })
  }, { times: 1 })

  const requestHeading = page.getByRole('heading', { name: 'Forgot your password?' })
  try {
    await signIn(page, oldPassword)
    assert.equal(await submitted.promise, 200)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await requestHeading.waitFor()
  } finally {
    release.resolve()
  }

  await page.getByRole('button', { name: 'Sign out' }).waitFor()
  assert.equal(new URL(page.url()).pathname, '/forgot-password')
  assert.equal(await requestHeading.isVisible(), true)
})

test('retries a failed request without duplicate submissions or revealing an unknown account', { timeout: 15000 }, async (t) => {
  const { page, origin, capturedMessages } = await openFixture(t)
  await page.goto(`${origin}/forgot-password`)
  const emailInput = page.getByLabel('NYU email')
  await emailInput.fill('fixture@example.test')
  await emailInput.press('Enter')
  await assertFocusedError(page, emailInput, 'Please enter a valid NYU email address.')

  const entered = Promise.withResolvers()
  const release = Promise.withResolvers()
  await page.route('**/api/auth/forgot-password', async (route) => {
    entered.resolve()
    await release.promise
    await route.fulfill({
      status: 503,
      json: { error: 'Password recovery is temporarily unavailable. Try again later.' },
    })
  }, { times: 1 })

  let attempts = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/api/auth/forgot-password')) attempts += 1
  })

  const unknown = 'unknown-recovery-fixture@nyu.edu'
  await emailInput.fill(unknown)
  await emailInput.press('Enter')
  await entered.promise
  const pending = page.getByRole('button', { name: 'Sending request...' })
  await pending.waitFor()
  assert.equal(await pending.isDisabled(), true)
  await page.locator('form').dispatchEvent('submit')
  release.resolve()

  await page.getByRole('alert').filter({ hasText: 'Could not request a reset code. Please try again.' }).waitFor()
  assert.equal(await emailInput.inputValue(), unknown)
  assert.equal(attempts, 1)
  await page.getByRole('button', { name: 'Send reset code' }).click()
  await page.getByText(genericConfirmation, { exact: true }).waitFor()
  assert.equal(attempts, 2)
  assert.equal((await capturedMessages()).length, 0)
})

test('offers a fresh code after an expired or exhausted code and an expired reset permission', async (t) => {
  const { page, origin, advance, latestCode } = await openFixture(t)
  await page.goto(`${origin}/forgot-password`)
  await requestCode(page)
  const expiredCode = await latestCode()
  advance(15 * minute)
  assert.equal((await verifyCode(page, expiredCode)).status(), 400)
  await page.getByRole('alert').filter({ hasText: /expired.*five incorrect attempts/ }).waitFor()

  const freshCode = page.getByRole('link', { name: 'Request a new code' })
  await freshCode.click()
  await requestCode(page)
  const code = await latestCode()
  const wrongCode = code === '00000000' ? '00000001' : '00000000'
  for (let attempt = 0; attempt < 5; attempt += 1) {
    assert.equal((await verifyCode(page, wrongCode)).status(), 400)
  }
  assert.equal((await verifyCode(page, code)).status(), 400)
  await page.getByRole('alert').filter({ hasText: /expired.*five incorrect attempts/ }).waitFor()

  advance(minute)
  await freshCode.click()
  await page.getByRole('heading', { name: 'Forgot your password?' }).waitFor()
  assert.equal(await page.getByLabel('NYU email').inputValue(), email)
  await requestCode(page)
  const release = Promise.withResolvers()
  await page.route('**/api/auth/verify-reset-code', async (route) => {
    await release.promise
    await route.continue()
  }, { times: 1 })
  const verified = verifyCode(page, await latestCode())
  const verifying = page.getByRole('button', { name: 'Verifying code...' })
  const password = page.getByLabel('New password', { exact: true })
  await verifying.waitFor()
  assert.equal(await verifying.isDisabled(), true)
  assert.equal(await password.count(), 0)
  release.resolve()
  assert.equal((await verified).status(), 200)
  const confirmation = page.getByLabel('Confirm new password', { exact: true })
  await password.fill(newPassword)
  await confirmation.fill(newPassword)
  advance(5 * minute)
  await confirmation.press('Enter')
  await page.getByRole('heading', { name: 'Password reset expired' }).waitFor()
  assert.equal(await password.count(), 0)
  await freshCode.click()
  await page.getByRole('heading', { name: 'Forgot your password?' }).waitFor()
  assert.equal(await page.getByLabel('NYU email').inputValue(), email)
})

async function leavePendingReset(t) {
  const { page, origin, api, latestCode } = await openFixture(t)
  await page.goto(`${origin}/login`)
  const login = page.waitForResponse('**/api/auth/login')
  await signIn(page, oldPassword)
  const { token } = await (await login).json()
  await page.waitForURL('**/setup-profile')
  await page.goBack()
  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await requestCode(page)
  assert.equal((await verifyCode(page, await latestCode())).status(), 200)

  const submitted = Promise.withResolvers()
  const release = Promise.withResolvers()
  t.after(() => release.resolve())
  await page.route('**/api/auth/reset-password', async (route) => {
    const response = await route.fetch()
    submitted.resolve(response.status())
    await release.promise
    await route.fulfill({ response })
  }, { times: 1 })

  const password = page.getByLabel('New password', { exact: true })
  const confirmation = page.getByLabel('Confirm new password', { exact: true })
  await password.fill(newPassword)
  await confirmation.fill(newPassword)
  await confirmation.press('Enter')
  assert.equal(await submitted.promise, 200)
  const pending = page.getByRole('button', { name: 'Updating password...' })
  await pending.waitFor()
  assert.equal(await pending.isDisabled(), true)
  await page.getByRole('link', { name: 'Request a new code' }).click()
  const requestHeading = page.getByRole('heading', { name: 'Forgot your password?' })
  await requestHeading.waitFor()

  return {
    page, api, token, requestHeading,
    async finishReset() {
      const finished = page.waitForResponse('**/api/auth/reset-password')
      release.resolve()
      const response = await finished
      assert.equal(await response.finished(), null)
    },
  }
}

test('a late successful reset clears the original session after leaving the form', { timeout: 15000 }, async (t) => {
  const { page, api, token, requestHeading, finishReset } = await leavePendingReset(t)
  const signOut = page.getByRole('button', { name: 'Sign out' })
  assert.equal(await signOut.isVisible(), true)
  await finishReset()
  assert.equal((await api('/users/me', undefined, token)).status, 401)
  await signOut.waitFor({ state: 'hidden' })
  assert.equal(await requestHeading.isVisible(), true)
})

test('a late reset response does not change the page or a newer session', { timeout: 15000 }, async (t) => {
  const { page, api, token, requestHeading, finishReset } = await leavePendingReset(t)
  await page.getByRole('link', { name: 'Back to sign in' }).click()
  const newLogin = page.waitForResponse('**/api/auth/login')
  await signIn(page, newPassword)
  const { token: newToken } = await (await newLogin).json()
  await page.waitForURL('**/setup-profile')
  await page.goBack()
  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await requestHeading.waitFor()

  await finishReset()
  assert.equal((await api('/users/me', undefined, token)).status, 401)
  assert.equal((await api('/users/me', undefined, newToken)).status, 200)
  assert.equal(await requestHeading.isVisible(), true)
  assert.equal(await page.getByRole('button', { name: 'Sign out' }).isVisible(), true)
})

test('reloading loses a verified code and the password form also expires when idle', async (t) => {
  const { page, origin, advance, latestCode } = await openFixture(t)
  await page.clock.install()
  await page.goto(`${origin}/forgot-password`)
  await requestCode(page)
  const usedCode = await latestCode()
  assert.equal((await verifyCode(page, usedCode)).status(), 200)
  const password = page.getByLabel('New password', { exact: true })
  await password.fill(newPassword)
  await page.reload()
  const code = page.getByLabel('Reset code', { exact: true })
  await code.waitFor()
  assert.equal(await code.inputValue(), '')
  assert.equal(await password.count(), 0)
  assert.equal(await page.getByText('If you already verified your code, request a new one to continue.', {
    exact: true,
  }).isVisible(), true)
  assert.equal((await verifyCode(page, usedCode)).status(), 400)
  await assertFocusedError(page, code, /invalid or has expired/i)

  advance(minute)
  await page.getByRole('link', { name: 'Request a new code' }).click()
  await requestCode(page)
  assert.equal((await verifyCode(page, await latestCode())).status(), 200)
  await password.waitFor()
  await page.clock.fastForward(5 * minute)
  await page.getByRole('heading', { name: 'Password reset expired' }).waitFor()
  assert.equal(await password.count(), 0)
  assert.equal(await page.getByRole('link', { name: 'Request a new code' }).isVisible(), true)
})
