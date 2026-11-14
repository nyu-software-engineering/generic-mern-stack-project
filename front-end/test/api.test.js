import assert from 'node:assert/strict'
import { test } from 'node:test'
import { api, ApiError } from '../src/services/api.js'

test('GET returns the parsed JSON from an /api path', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json([{ id: 1 }]))

  assert.deepEqual(await api('/listings/mine'), [{ id: 1 }])
  const [url, options] = fetchMock.mock.calls[0].arguments
  assert.equal(url, '/api/listings/mine')
  assert.equal(options.method, 'GET')
  assert.equal(options.body, undefined)
})

test('POST sends the body as JSON', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ id: 9 }, { status: 201 }))

  assert.deepEqual(await api('/listings', { method: 'POST', body: { title: 'Kettle' } }), { id: 9 })
  const [, options] = fetchMock.mock.calls[0].arguments
  assert.equal(options.method, 'POST')
  assert.equal(options.headers['Content-Type'], 'application/json')
  assert.equal(options.body, '{"title":"Kettle"}')
})

test('an empty 204 response returns null', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }))

  assert.equal(await api('/notifications/1', { method: 'DELETE' }), null)
})

test('a route error keeps the server message, status, and field errors', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ error: 'Invalid listing details.', errors: { title: 'Add a title.' } }, { status: 400 }))

  await assert.rejects(api('/listings', { method: 'POST', body: {} }), (error) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.message, 'Invalid listing details.')
    assert.equal(error.status, 400)
    assert.deepEqual(error.errors, { title: 'Add a title.' })
    return true
  })
})

test('a non-JSON error reports its status', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('Too many', { status: 429 }))

  await assert.rejects(api('/mock-data'), { message: 'Request failed (429).', status: 429 })
})

test('says the back-end is not running when the proxy or network fails', async (t) => {
  // Vite's proxy answers with an empty 502 when Express is not running.
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 502 }))
  await assert.rejects(api('/mock-data'), { message: /Is it running\?/, status: 502 })

  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('fetch failed') })
  await assert.rejects(api('/mock-data'), { message: /Is it running\?/, status: 0 })
})
