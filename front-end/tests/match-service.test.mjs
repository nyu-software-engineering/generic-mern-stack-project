import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const profile = JSON.parse(readFileSync(new URL('../mocks/profile.json', import.meta.url)))
let server, baseURL
before(async () => {
  server = await createServer({ root: fileURLToPath(new URL('../', import.meta.url)), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' })
  await server.listen()
  baseURL = `http://127.0.0.1:${server.httpServer.address().port}`
})
after(async () => { await server.close() })
async function request(saved, job = 'brightspace-software-intern') {
  return fetch(`${baseURL}/api/matches/${job}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: saved }) })
}

test('mock matches use the current saved skills and echo the selected job and profile revision', async () => {
  const initial = await request(profile)
  assert.equal(initial.status, 200)
  const data = await initial.json()
  assert.equal(data.jobId, 'brightspace-software-intern')
  assert.equal(data.profileId, profile.id)
  assert.equal(data.profileRevision, 1)
  assert.equal(data.score, 92)
  assert.deepEqual(data.missingSkills, ['Git'])
  const changed = await request({ ...profile, revision: 2, skills: [...profile.skills, 'Git'] })
  assert.equal(changed.status, 200)
  const newer = await changed.json()
  assert.equal(newer.profileRevision, 2)
  assert.equal(newer.score, 100)
  assert.deepEqual(newer.missingSkills, [])
  assert.ok(newer.fitExplanation.some(text => text.includes('Git')))
  const removed = await request({ ...profile, revision: 3, skills: ['Python'] })
  const fewer = await removed.json()
  assert.equal(fewer.score, 46)
  assert.deepEqual(fewer.missingSkills, ['React', 'Git'])
  assert.ok(!fewer.fitExplanation.some(text => text.includes('React')))
})

for (const [name, changes] of [['missing skills', { skills: null }], ['malformed skills', { skills: [12] }],
  ['missing major', { major: '' }], ['foreign profile', { id: 'other-user' }], ['invalid revision', { revision: -1 }]]) {
  test(`mock match rejects ${name}`, async () => {
    const result = await request({ ...profile, ...changes })
    assert.equal(result.status, 400)
    assert.equal(typeof (await result.json()).error, 'string')
  })
}

test('missing jobs remain JSON 404 and malformed bodies fail without crashing the mock host', async () => {
  const missing = await request(profile, 'not-a-job')
  assert.equal(missing.status, 404)
  assert.equal(typeof (await missing.json()).error, 'string')
  const broken = await fetch(`${baseURL}/api/matches/brightspace-software-intern`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })
  assert.equal(broken.status, 400)
  assert.equal((await request(profile)).status, 200)
})

for (const body of [null, [], { profile: null }]) {
  test(`mock match rejects an invalid JSON body ${JSON.stringify(body)}`, async () => {
    const result = await fetch(`${baseURL}/api/matches/brightspace-software-intern`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    assert.equal(result.status, 400)
  })
}
