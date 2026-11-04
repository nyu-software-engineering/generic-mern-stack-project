import assert from 'node:assert/strict'
import { before, test } from 'node:test'

let filterJobs
before(async () => {
  const module = await import('../src/jobs/browse.js').catch(() => null)
  assert.equal(typeof module?.filterJobs, 'function', 'The Browse filtering helper must be implemented')
  filterJobs = module.filterJobs
})

const jobs = Object.freeze([
  Object.freeze({ id: 'today', jobType: 'internship', sponsorsVisa: true, deadline: '2026-11-02' }),
  Object.freeze({ id: 'boundary', jobType: 'internship', sponsorsVisa: false, deadline: '2026-11-09' }),
  Object.freeze({ id: 'later', jobType: 'entry-level', sponsorsVisa: true, deadline: '2026-11-10' }),
  Object.freeze({ id: 'unknown', jobType: 'contract', sponsorsVisa: null, deadline: '2026-02-31' }),
  Object.freeze({ id: 'missing', sponsorsVisa: null }),
  Object.freeze({ id: 'expired', jobType: 'internship', sponsorsVisa: true, deadline: '2026-11-01' }),
])
const ids = (items) => items.map((job) => job.id)
const today = '2026-11-02'

test('no filters returns every record in source order without mutating the shared feed', () => {
  const result = filterJobs(jobs, {}, today)
  assert.deepEqual(result, jobs)
  assert.notEqual(result, jobs)
  assert.deepEqual(ids(jobs), ['today', 'boundary', 'later', 'unknown', 'missing', 'expired'])
})

test('job types use OR while different filter categories use AND', () => {
  assert.deepEqual(ids(filterJobs(jobs, { jobTypes: ['internship', 'entry-level'] }, today)),
    ['today', 'boundary', 'later', 'expired'])
  assert.deepEqual(ids(filterJobs(jobs, { jobTypes: ['internship'], sponsorsOnly: true, deadlineDays: 7 }, today)),
    ['today'])
})

test('sponsorship only matches true, never false or unknown', () => {
  assert.deepEqual(ids(filterJobs(jobs, { sponsorsOnly: true }, today)), ['today', 'later', 'expired'])
})

test('deadline windows include today and the boundary but exclude expired, later, or unknown dates', () => {
  assert.deepEqual(ids(filterJobs(jobs, { deadlineDays: 7 }, today)), ['today', 'boundary'])
  assert.deepEqual(ids(filterJobs(jobs, { deadlineDays: 30 }, today)), ['today', 'boundary', 'later'])
  assert.deepEqual(ids(filterJobs(jobs, { deadlineDays: null }, today)), ids(jobs))
})

test('impossible calendar dates are rejected instead of rolling into another month', () => {
  const dates = ['2026-02-29', '2026-02-31', '2026-13-01', 'not-a-date', '2026-02-28']
  assert.deepEqual(filterJobs(dates.map((deadline) => ({ deadline })), { deadlineDays: 30 }, '2026-02-01'),
    [{ deadline: '2026-02-28' }])
  assert.equal(filterJobs([{ deadline: '2028-02-29' }], { deadlineDays: 30 }, '2028-02-01').length, 1)
})

test('valid future job types remain in the unrestricted feed but do not match an explicit type', () => {
  assert.ok(filterJobs(jobs, {}, today).some((job) => job.id === 'unknown'))
  assert.deepEqual(filterJobs(jobs, { jobTypes: ['entry-level'], sponsorsOnly: true, deadlineDays: 7 }, today), [])
})
