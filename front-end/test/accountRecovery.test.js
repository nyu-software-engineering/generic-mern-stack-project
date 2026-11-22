import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError, setSessionToken } from '../src/services/api.js'

const email = 'recovery-fixture@nyu.edu'
const code = '00123456'
const resetToken = 'a'.repeat(64)
const password = 'Synthetic-fixture-password'
const confirmation = {
  message: 'If an account exists for this email, password reset instructions will be sent.',
}
const success = { message: 'Password updated. Sign in with your new password.' }
const operations = [
  {
    name: 'requestPasswordReset',
    args: [email],
    path: '/api/auth/forgot-password',
    body: { email },
    result: confirmation,
    status: 202,
    error: { status: 503, message: 'Password recovery is temporarily unavailable.' },
  },
  {
    name: 'verifyPasswordResetCode',
    args: [email, code],
    path: '/api/auth/verify-reset-code',
    body: { email, code },
    result: { resetToken, expiresIn: 300 },
    status: 200,
    error: { status: 400, message: 'This recovery code is invalid or has expired.' },
  },
  {
    name: 'resetPassword',
    args: [resetToken, password],
    path: '/api/auth/reset-password',
    body: { resetToken, password },
    result: success,
    status: 200,
    error: { status: 429, message: 'Too many attempts. Try again later.' },
  },
]

for (const operation of operations) {
  test(`${operation.name} sends the expected public request and returns its response`, async (t) => {
    const recovery = await import('../src/services/accountRecovery.js')
    setSessionToken('fixture-stale-session')
    t.after(() => setSessionToken(null))

    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      Response.json(operation.result, { status: operation.status }))

    assert.deepEqual(await recovery[operation.name](...operation.args), operation.result)
    assert.equal(fetchMock.mock.calls.length, 1)
    const [url, options] = fetchMock.mock.calls[0].arguments
    assert.equal(url, operation.path)
    assert.equal(options.method, 'POST')
    assert.deepEqual(options.headers, { 'Content-Type': 'application/json' })
    assert.deepEqual(JSON.parse(options.body), operation.body)
  })

  test(`${operation.name} preserves safe API errors`, async (t) => {
    const recovery = await import('../src/services/accountRecovery.js')
    t.mock.method(globalThis, 'fetch', async () =>
      Response.json({ error: operation.error.message }, { status: operation.error.status }))

    await assert.rejects(recovery[operation.name](...operation.args), (error) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.status, operation.error.status)
      assert.equal(error.message, operation.error.message)
      return true
    })
  })
}
