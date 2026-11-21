import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createAuthSession,
  readPendingSignup,
} from '../src/context/authSession.js'
import { api, setSessionToken } from '../src/services/api.js'
import {
  createListing,
  getMyListings,
} from '../src/services/listings.js'

function memoryStorage() {
  const values = new Map()

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

function prepare(t) {
  const previousStorage = globalThis.sessionStorage
  const storage = memoryStorage()

  globalThis.sessionStorage = storage
  setSessionToken(null)

  t.after(() => {
    setSessionToken(null)

    if (previousStorage === undefined) {
      delete globalThis.sessionStorage
    } else {
      globalThis.sessionStorage = previousStorage
    }
  })

  return storage
}

function harness() {
  let currentUser = null
  let pendingSignup = readPendingSignup()

  const actions = createAuthSession({
    onCurrentUser(value) {
      currentUser = value
    },
    onPendingSignup(value) {
      pendingSignup = value
    },
  })

  return {
    actions,
    get user() {
      return currentUser
    },
    get pending() {
      return pendingSignup
    },
  }
}

const account = {
  id: 'account-student',
  email: 'student@nyu.edu',
  displayName: 'Test Student',
  campusArea: '',
  emailVerified: true,
}

test('signup verification survives a page reload', async (t) => {
  const storage = prepare(t)

  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async (url, options) => {
      if (url === '/api/auth/signup') {
        return Response.json({
          user: { email: 'student@nyu.edu' },
          demoCode: '123456',
        }, { status: 201 })
      }

      if (url === '/api/auth/verify') {
        assert.deepEqual(JSON.parse(options.body), {
          email: 'student@nyu.edu',
          code: '123456',
        })

        return Response.json({
          user: account,
        })
      }

      throw new Error(`Unexpected request: ${url}`)
    }
  )

  const firstPage = harness()

  await firstPage.actions.signUp(
    'Test Student',
    'student@nyu.edu',
    'password123'
  )

  assert.deepEqual(firstPage.pending, {
    email: 'student@nyu.edu',
    demoCode: '123456',
  })

  assert.ok(readPendingSignup())

  // Simulate a fresh AuthProvider after reloading.
  const restoredPage = harness()

  assert.deepEqual(restoredPage.pending, {
    email: 'student@nyu.edu',
    demoCode: '123456',
  })

  await restoredPage.actions.verifyEmail('123456')

  assert.equal(restoredPage.pending.demoCode, '')
  assert.equal(readPendingSignup(), null)
  assert.equal(storage.getItem('dormshare-pending-verification'), null)
  assert.equal(fetchMock.mock.callCount(), 2)
})

test('login forwards identity to listing services and sign-out clears it', async (t) => {
  prepare(t)

  const calls = []
  const sessionToken = 'a'.repeat(64)

  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options })

    if (url === '/api/auth/login') {
      return Response.json({
        user: account,
        token: sessionToken,
      })
    }

    if (url === '/api/users/me') {
      return Response.json({ user: account })
    }

    if (url === '/api/listings/mine') {
      return Response.json([])
    }

    if (url === '/api/listings' && options.method === 'POST') {
      return Response.json({
        id: 501,
        ownerId: account.id,
        title: 'Desk lamp',
        status: 'draft',
      }, { status: 201 })
    }

    throw new Error(`Unexpected request: ${url}`)
  })

  const session = harness()

  await session.actions.signIn(
    account.email,
    'password123'
  )

  assert.equal(session.user.id, account.id)

  await getMyListings()

  const created = await createListing({
    title: 'Desk lamp',
  })

  assert.equal(created.ownerId, account.id)

  const listingRequests = calls.filter((call) =>
    call.url === '/api/listings/mine' ||
    call.url === '/api/listings'
  )

  assert.equal(listingRequests.length, 2)

  for (const call of listingRequests) {
    assert.equal(
      call.options.headers.Authorization,
      `Bearer ${sessionToken}`
    )
  }

  const loginRequest = calls.find(
    (call) => call.url === '/api/auth/login'
  )

  assert.equal(loginRequest.options.headers.Authorization, undefined)

  session.actions.signOut()

  assert.equal(session.user, null)

  await api('/listings/mine')

  assert.equal(
    calls.at(-1).options.headers?.Authorization,
    undefined
  )
})

test('reset sign-out keeps matching or newer pending email verification', async (t) => {
  prepare(t)

  const pending = { email: 'pending@nyu.edu', demoCode: '123456' }
  let listingAuthorization
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === '/api/auth/login') {
      if (JSON.parse(options.body).password === 'wrong-password') {
        return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
      }
      return Response.json({ token: 'a'.repeat(64), user: account })
    }

    if (url === '/api/users/me') {
      return Response.json({ user: account })
    }

    if (url === '/api/auth/signup') {
      return Response.json({ user: { email: pending.email }, demoCode: pending.demoCode }, { status: 201 })
    }

    assert.equal(url, '/api/listings/mine')
    listingAuthorization = options.headers?.Authorization
    return Response.json([])
  })

  const session = harness()
  await session.actions.signIn(account.email, 'password123')
  await session.actions.signUp('Pending Student', pending.email, 'password123')
  assert.equal(session.user.id, account.id)

  const signOutAfterMatchingReset = session.actions.prepareResetSignOut(pending.email)
  signOutAfterMatchingReset()

  assert.equal(session.user, null)
  await api('/listings/mine')
  assert.equal(listingAuthorization, undefined)
  assert.deepEqual(session.pending, pending)
  assert.deepEqual(readPendingSignup(), pending)

  session.actions.signOut()
  assert.equal(session.pending, null)
  assert.equal(readPendingSignup(), null)

  await session.actions.signUp('Pending Student', pending.email, 'password123')
  const signOutAfterOtherReset = session.actions.prepareResetSignOut(account.email)
  signOutAfterOtherReset()
  assert.equal(session.pending, null)
  assert.equal(readPendingSignup(), null)

  await session.actions.signIn(account.email, 'password123')
  const signOutAfterOlderReset = session.actions.prepareResetSignOut(account.email)
  await assert.rejects(session.actions.signIn(account.email, 'wrong-password'), /Invalid email or password/)
  await session.actions.signUp('Pending Student', pending.email, 'password123')
  signOutAfterOlderReset()
  assert.equal(session.user, null)
  assert.deepEqual(session.pending, pending)
  assert.deepEqual(readPendingSignup(), pending)
})

test('late reset preserves a newer sign-in waiting for its profile', async (t) => {
  prepare(t)

  const oldToken = 'a'.repeat(64)
  const newToken = 'b'.repeat(64)
  const newProfileRequested = Promise.withResolvers()
  const newProfile = Promise.withResolvers()
  let authorization

  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === '/api/auth/login') {
      const { password } = JSON.parse(options.body)
      return Response.json({ token: password === 'old-password' ? oldToken : newToken })
    }
    if (url === '/api/users/me') {
      if (options.headers.Authorization === `Bearer ${newToken}`) {
        newProfileRequested.resolve()
        return newProfile.promise
      }
      return Response.json({ user: account })
    }
    assert.equal(url, '/api/listings/mine')
    authorization = options.headers?.Authorization
    return Response.json([])
  })

  const session = harness()
  await session.actions.signIn(account.email, 'old-password')
  const finishReset = session.actions.prepareResetSignOut(account.email)
  const newerSignIn = session.actions.signIn(account.email, 'new-password')
  await newProfileRequested.promise

  finishReset()
  assert.equal(session.user, null)
  await api('/listings/mine')
  assert.equal(authorization, undefined)

  newProfile.resolve(Response.json({ user: account }))
  assert.deepEqual(await newerSignIn, account)
  assert.deepEqual(session.user, account)
  await api('/listings/mine')
  assert.equal(authorization, `Bearer ${newToken}`)
})

test('late reset clears a session installed by an earlier sign-in request', async (t) => {
  prepare(t)

  const loginResponse = Promise.withResolvers()
  const token = 'a'.repeat(64)
  let authorization

  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === '/api/auth/login') return loginResponse.promise
    if (url === '/api/users/me') return Response.json({ user: account })
    assert.equal(url, '/api/listings/mine')
    authorization = options.headers?.Authorization
    return Response.json([])
  })

  const session = harness()
  const olderSignIn = session.actions.signIn(account.email, 'old-password')
  const finishReset = session.actions.prepareResetSignOut(account.email)

  loginResponse.resolve(Response.json({ token }))
  await olderSignIn
  assert.deepEqual(session.user, account)
  await api('/listings/mine')
  assert.equal(authorization, `Bearer ${token}`)

  finishReset()
  assert.equal(session.user, null)
  await api('/listings/mine')
  assert.equal(authorization, undefined)
})

test('late reset clears unrelated verification installed by an earlier signup request', async (t) => {
  prepare(t)

  const signupResponse = Promise.withResolvers()
  const pending = { email: 'pending@nyu.edu', demoCode: '123456' }

  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, '/api/auth/signup')
    return signupResponse.promise
  })

  const session = harness()
  const olderSignup = session.actions.signUp('Pending Student', pending.email, 'password123')
  const finishReset = session.actions.prepareResetSignOut(account.email)

  signupResponse.resolve(Response.json({ user: { email: pending.email }, demoCode: pending.demoCode }, { status: 201 }))
  await olderSignup
  assert.deepEqual(readPendingSignup(), pending)

  finishReset()
  assert.equal(session.pending, null)
  assert.equal(readPendingSignup(), null)
})

test('late reset clears unrelated pending signup after two newer sign-in failures', async (t) => {
  const storage = prepare(t)
  const pending = { email: 'pending@nyu.edu', demoCode: '123456' }
  storage.setItem('dormshare-pending-verification', JSON.stringify(pending))

  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, '/api/auth/login')
    return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
  })

  const session = harness()
  const finishReset = session.actions.prepareResetSignOut(account.email)
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await assert.rejects(session.actions.signIn(account.email, 'wrong-password'), /Invalid email or password/)
  }

  finishReset()
  assert.equal(session.pending, null)
  assert.equal(readPendingSignup(), null)
})

test('late reset preserves a newer signup and still invalidates an earlier sign-in', async (t) => {
  prepare(t)

  const loginResponse = Promise.withResolvers()
  const signupResponse = Promise.withResolvers()
  const pending = { email: 'pending@nyu.edu', demoCode: '123456' }

  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url === '/api/auth/login') return loginResponse.promise
    if (url === '/api/auth/signup') return signupResponse.promise
    assert.equal(url, '/api/users/me')
    return Response.json({ user: account })
  })

  const session = harness()
  const olderSignIn = session.actions.signIn(account.email, 'old-password')
  const finishReset = session.actions.prepareResetSignOut(account.email)
  const newerSignup = session.actions.signUp('Pending Student', pending.email, 'password123')
  finishReset()

  loginResponse.resolve(Response.json({ token: 'a'.repeat(64) }))
  await assert.rejects(olderSignIn, /Session changed/)

  signupResponse.resolve(Response.json({ user: { email: pending.email }, demoCode: pending.demoCode }, { status: 201 }))
  await newerSignup
  assert.equal(session.user, null)
  assert.deepEqual(session.pending, pending)
  assert.deepEqual(readPendingSignup(), pending)
})

test('late reset preserves newer verification for a different email', async (t) => {
  const storage = prepare(t)
  const verificationResponse = Promise.withResolvers()
  const pending = { email: 'pending@nyu.edu', demoCode: '123456' }
  storage.setItem('dormshare-pending-verification', JSON.stringify(pending))

  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/auth/verify')
    assert.deepEqual(JSON.parse(options.body), { email: pending.email, code: pending.demoCode })
    return verificationResponse.promise
  })

  const session = harness()
  const finishReset = session.actions.prepareResetSignOut(account.email)
  const newerVerification = session.actions.verifyEmail(pending.demoCode)
  finishReset()

  const verified = { ...account, email: pending.email }
  verificationResponse.resolve(Response.json({ user: verified }))
  assert.deepEqual(await newerVerification, verified)
  assert.deepEqual(session.pending, { email: pending.email, demoCode: '' })
  assert.equal(readPendingSignup(), null)
  assert.equal(session.user, null)
})

test('a late profile response cannot restore a signed-out user', async (t) => {
  prepare(t)

  let finishProfileSave

  const token = 'a'.repeat(64)

  t.mock.method(globalThis, 'fetch', (url, options) => {
    if (url === '/api/auth/login') {
      return Promise.resolve(
        Response.json({ token, user: account })
      )
    }

    if (url === '/api/users/me' && options.method === 'GET') {
      return Promise.resolve(Response.json({ user: account }))
    }

    if (url === '/api/users/me' && options.method === 'PUT') {
      return new Promise((resolve) => {
        finishProfileSave = resolve
      })
    }

    throw new Error(`Unexpected request: ${url}`)
  })

  const session = harness()

  await session.actions.signIn(
    account.email,
    'password123'
  )

  const pendingSave = session.actions.updateProfile(
    'Updated Student',
    'Washington Square'
  )

  assert.equal(typeof finishProfileSave, 'function')

  session.actions.signOut()

  finishProfileSave(Response.json({
    user: {
      ...account,
      displayName: 'Updated Student',
      campusArea: 'Washington Square',
    },
  }))

  await assert.rejects(
    pendingSave,
    /Session changed/
  )

  assert.equal(session.user, null)
})

test('a late profile response cannot overwrite another login', async (t) => {
  prepare(t)

  let finishProfileSave

  const firstToken = 'a'.repeat(64)
  const secondToken = 'b'.repeat(64)

  const secondAccount = {
    ...account,
    id: 'account-second',
    email: 'second@nyu.edu',
    displayName: 'Second Student',
  }

  t.mock.method(globalThis, 'fetch', (url, options) => {
    if (url === '/api/auth/login') {
      const { email } = JSON.parse(options.body)
      const isSecond = email === secondAccount.email

      return Promise.resolve(Response.json({
        token: isSecond ? secondToken : firstToken,
        user: isSecond ? secondAccount : account,
      }))
    }

    if (url === '/api/users/me' && options.method === 'GET') {
      const isSecond =
        options.headers.Authorization === `Bearer ${secondToken}`

      return Promise.resolve(Response.json({
        user: isSecond ? secondAccount : account,
      }))
    }

    if (url === '/api/users/me' && options.method === 'PUT') {
      return new Promise((resolve) => {
        finishProfileSave = resolve
      })
    }

    throw new Error(`Unexpected request: ${url}`)
  })

  const session = harness()

  await session.actions.signIn(
    account.email,
    'password123'
  )

  const pendingSave = session.actions.updateProfile(
    'Changed First Student',
    'Washington Square'
  )

  assert.equal(typeof finishProfileSave, 'function')

  await session.actions.signIn(
    secondAccount.email,
    'password123'
  )

  finishProfileSave(Response.json({
    user: {
      ...account,
      displayName: 'Changed First Student',
    },
  }))

  await assert.rejects(
    pendingSave,
    /Session changed/
  )

  assert.equal(session.user.id, secondAccount.id)
  assert.equal(session.user.displayName, 'Second Student')
})

test('an interrupted login cannot restore a session after sign-out', async (t) => {
  prepare(t)

  let finishLogin

  t.mock.method(globalThis, 'fetch', (url) => {
    if (url === '/api/auth/login') {
      return new Promise((resolve) => {
        finishLogin = resolve
      })
    }

    if (url === '/api/users/me') {
      return Promise.resolve(Response.json({ user: account }))
    }

    throw new Error(`Unexpected request: ${url}`)
  })

  const session = harness()

  const pendingLogin = session.actions.signIn(
    account.email,
    'password123'
  )

  session.actions.signOut()

  finishLogin(Response.json({
    user: account,
    token: 'a'.repeat(64),
  }))

  await assert.rejects(
    pendingLogin,
    /Session changed/
  )

  assert.equal(session.user, null)
})
