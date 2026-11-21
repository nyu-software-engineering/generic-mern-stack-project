import assert from 'node:assert/strict'
import { test } from 'node:test'
import { api, ApiError, setSessionToken } from '../src/services/api.js'

test('GET returns the parsed JSON from an /api path', async (t) => {
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => Response.json([{ id: 1 }])
  )

  assert.deepEqual(await api('/listings/mine'), [{ id: 1 }])

  const [url, options] = fetchMock.mock.calls[0].arguments
  assert.equal(url, '/api/listings/mine')
  assert.equal(options.method, 'GET')
  assert.equal(options.body, undefined)
})

test('POST sends the body as JSON', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ id: 9 }, { status: 201 }))

  assert.deepEqual(
    await api('/listings', {
      method: 'POST',
      body: { title: 'Kettle' },
    }),
    { id: 9 }
  )

  const [, options] = fetchMock.mock.calls[0].arguments
  assert.equal(options.method, 'POST')
  assert.equal(options.headers['Content-Type'], 'application/json')
  assert.equal(options.body, '{"title":"Kettle"}')
})

test('an empty 204 response returns null', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(null, { status: 204 })
  )

  assert.equal(
    await api('/notifications/1', { method: 'DELETE' }),
    null
  )
})

test('a successful response with malformed JSON throws', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    new Response('{"id": 1', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

  await assert.rejects(api('/listings/mine'), (error) => {
    assert.ok(error instanceof ApiError)
    assert.equal(
      error.message,
      'Could not read the response from the back-end.'
    )
    assert.equal(error.status, 200)
    return true
  })
})

test('a successful response whose body fails to read throws', async (t) => {
  const body = new ReadableStream({
    start(controller) {
      controller.error(
        new DOMException('The operation timed out.', 'TimeoutError')
      )
    },
  })

  t.mock.method(globalThis, 'fetch', async () =>
    new Response(body, { status: 200 }))

  await assert.rejects(api('/mock-data'), {
    name: 'ApiError',
    message: 'Could not read the response from the back-end.',
    status: 200,
  })
})

test('a route error keeps the server message, status, and field errors', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json(
      {
        error: 'Invalid listing details.',
        errors: { title: 'Add a title.' },
      },
      { status: 400 }
    ))

  await assert.rejects(
    api('/listings', { method: 'POST', body: {} }),
    (error) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.message, 'Invalid listing details.')
      assert.equal(error.status, 400)
      assert.deepEqual(error.errors, { title: 'Add a title.' })
      return true
    }
  )
})

test('a non-JSON error reports its status', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('Too many', { status: 429 })
  )

  await assert.rejects(api('/mock-data'), {
    message: 'Request failed (429).',
    status: 429,
  })
})

test('says the back-end is not running when the proxy or network fails', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('', { status: 502 })
  )

  await assert.rejects(api('/mock-data'), {
    message: /Is it running\?/,
    status: 502,
  })

  t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('fetch failed')
  })

  await assert.rejects(api('/mock-data'), {
    message: /Is it running\?/,
    status: 0,
  })
})

test('sends a bearer token with authenticated requests', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ user: { id: 'account-1' } }))

  await api('/users/me', {
    method: 'PUT',
    body: {
      displayName: 'Test Student',
      campusArea: 'Washington Square',
    },
    token: 'session-token',
  })

  const [url, options] = fetchMock.mock.calls[0].arguments
  assert.equal(url, '/api/users/me')
  assert.equal(options.headers.Authorization, 'Bearer session-token')
  assert.equal(options.headers['Content-Type'], 'application/json')
  assert.equal(
    options.body,
    JSON.stringify({
      displayName: 'Test Student',
      campusArea: 'Washington Square',
    })
  )
})

test('automatically sends the active token to existing services', async (t) => {
  setSessionToken('active-token')
  t.after(() => setSessionToken(null))

  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json([]))

  await api('/listings/mine')
  await api('/owner/dashboard')
  await api('/bookings/requests')

  for (const call of fetchMock.mock.calls) {
    assert.equal(
      call.arguments[1].headers.Authorization,
      'Bearer active-token'
    )
  }
})

test('public authentication requests do not inherit the active token', async (t) => {
  setSessionToken('active-token')
  t.after(() => setSessionToken(null))

  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ ok: true }))

  await api('/auth/login', {
    method: 'POST',
    body: {
      email: 'student@nyu.edu',
      password: 'password123',
    },
  })

  const [, options] = fetchMock.mock.calls[0].arguments
  assert.equal(options.headers.Authorization, undefined)
  assert.equal(options.headers['Content-Type'], 'application/json')
})

test('sign-out stops sending the previous token', async (t) => {
  setSessionToken('active-token')
  t.after(() => setSessionToken(null))

  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json([]))

  await api('/listings/mine')

  setSessionToken(null)

  await api('/listings/mine')

  const first = fetchMock.mock.calls[0].arguments[1]
  const second = fetchMock.mock.calls[1].arguments[1]

  assert.equal(first.headers.Authorization, 'Bearer active-token')
  assert.equal(second.headers?.Authorization, undefined)
})

test('ignores a service response after the session changes', async (t) => {
  setSessionToken('previous-token')
  t.after(() => setSessionToken(null))

  let finishRequest

  t.mock.method(
    globalThis,
    'fetch',
    () => new Promise((resolve) => {
      finishRequest = resolve
    })
  )

  const request = api('/listings/mine')

  setSessionToken(null)

  finishRequest(Response.json([{ id: 1 }]))

  await assert.rejects(request, {
    name: 'ApiError',
    message: 'Session changed. Please try again.',
    status: 401,
  })
})