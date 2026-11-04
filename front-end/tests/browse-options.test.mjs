import assert from 'node:assert/strict'
import { before, test } from 'node:test'

let filterJobs
let searchJobs
let sortJobs
let getJobLocations
before(async () => {
  const module = await import('../src/jobs/browse.js').catch(() => null)
  assert.equal(typeof module?.filterJobs, 'function', 'The Browse filtering helper must be implemented')
  filterJobs = module.filterJobs
  searchJobs = module.searchJobs
  sortJobs = module.sortJobs
  getJobLocations = module.getJobLocations
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

const locationRecords = Object.freeze([
  Object.freeze({ id: 'ny', location: ' New York, NY ', jobType: 'internship', sponsorsVisa: true, deadline: '2026-11-09', title: 'React Intern' }),
  Object.freeze({ id: 'boston', location: 'Boston, MA', jobType: 'internship', sponsorsVisa: false, deadline: '2026-11-09', title: 'React Intern' }),
  Object.freeze({ id: 'duplicate', location: 'new york, ny', jobType: 'entry-level', sponsorsVisa: true, deadline: '2026-11-10', title: 'React Engineer' }),
  Object.freeze({ id: 'remote', location: 'Remote, United States', sponsorsVisa: true }),
  Object.freeze({ id: 'partial', location: 'New York' }),
  Object.freeze({ id: 'empty', location: '  ' }),
  Object.freeze({ id: 'missing' }),
  Object.freeze({ id: 'null', location: null }),
])

test('location choices trim and deduplicate complete labels case-insensitively, then sort alphabetically', () => {
  assert.equal(typeof getJobLocations, 'function', 'The location choices helper must be implemented')
  assert.deepEqual(getJobLocations(locationRecords), ['Boston, MA', 'New York', 'New York, NY', 'Remote, United States'])
  assert.deepEqual(getJobLocations([]), [])
  assert.equal(locationRecords[0].location, ' New York, NY ')
})

test('empty or absent location selection preserves every record, including unknown locations', () => {
  assert.deepEqual(ids(filterJobs(locationRecords, {}, today)), ids(locationRecords))
  assert.deepEqual(ids(filterJobs(locationRecords, { locations: [] }, today)), ids(locationRecords))
})

test('selected locations use normalized exact labels and OR without changing source order or data', () => {
  const selected = Object.freeze([' NEW YORK, NY ', 'Boston, MA'])
  assert.deepEqual(ids(filterJobs(locationRecords, { locations: selected }, today)), ['ny', 'boston', 'duplicate'])
  assert.deepEqual(ids(filterJobs(locationRecords, { locations: ['Remote, United States'] }, today)), ['remote'])
  assert.deepEqual(filterJobs(locationRecords, { locations: ['New York, NY unavailable'] }, today), [])
  assert.deepEqual(selected, [' NEW YORK, NY ', 'Boston, MA'])
  assert.deepEqual(ids(locationRecords), ['ny', 'boston', 'duplicate', 'remote', 'partial', 'empty', 'missing', 'null'])
})

test('location selection intersects type, sponsorship, deadline, and search rather than replacing them', () => {
  const filters = { locations: ['New York, NY', 'Boston, MA'], jobTypes: ['internship'], sponsorsOnly: true, deadlineDays: 7 }
  assert.deepEqual(ids(searchJobs(filterJobs(locationRecords, filters, today), ' react ')), ['ny'])
  assert.deepEqual(searchJobs(filterJobs(locationRecords, filters, today), 'engineer'), [])
  assert.deepEqual(ids(filterJobs(locationRecords, { locations: ['New York, NY', 'Boston, MA'], sponsorsOnly: true }, today)), ['ny', 'duplicate'])
})

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

const searchRecords = Object.freeze([
  Object.freeze({ id: 'unknown', title: 'Designer', company: 'Studio', matchScore: null, notes: 'React' }),
  Object.freeze({ id: 'zero', title: 'Engineer', company: 'Labs', matchScore: 0, requirements: Object.freeze(['React experience']) }),
  Object.freeze({ id: 'high', title: 'Engineer', company: 'Labs', matchScore: 90, description: Object.freeze(['Build React interfaces']) }),
])

test('search matches a trimmed case-insensitive phrase in title, company, description, or requirements', () => {
  assert.equal(typeof searchJobs, 'function', 'The Browse search helper must be implemented')
  assert.deepEqual(ids(searchJobs(searchRecords, ' react ')), ['zero', 'high'])
  assert.deepEqual(ids(searchJobs(searchRecords, 'ENGINEER')), ['zero', 'high'])
  assert.deepEqual(ids(searchJobs(searchRecords, 'studio')), ['unknown'])
  assert.deepEqual(ids(searchJobs(searchRecords, 'build react')), ['high'])
  assert.deepEqual(ids(searchJobs(searchRecords, 'react build')), [])
  assert.deepEqual(ids(searchJobs(searchRecords, 'no match')), [])
})

test('empty search preserves filtered source order in a fresh array', () => {
  assert.equal(typeof searchJobs, 'function', 'The Browse search helper must be implemented')
  for (const query of ['', '   ']) {
    const result = searchJobs(searchRecords, query)
    assert.deepEqual(result, searchRecords)
    assert.notEqual(result, searchRecords)
  }
  assert.deepEqual(searchJobs([{ id: 'missing-text' }], '   '), [{ id: 'missing-text' }])
  const records = searchRecords.map((job) => ({ ...job, jobType: job.id === 'high' ? 'entry-level' : 'internship' }))
  assert.deepEqual(ids(searchJobs(filterJobs(records, { jobTypes: ['internship'] }), 'react')), ['zero'])
})

test('best match puts zero before unknown and keeps tied scores in source order without mutation', () => {
  assert.equal(typeof sortJobs, 'function', 'The Browse sort helper must be implemented')
  assert.deepEqual(ids(sortJobs(searchRecords, 'best-match')), ['high', 'zero', 'unknown'])
  assert.deepEqual(ids(sortJobs(searchRecords)), ['high', 'zero', 'unknown'])
  const records = Object.freeze([
    ...searchRecords,
    Object.freeze({ id: 'also-high', matchScore: 90 }),
    Object.freeze({ id: 'missing' }),
  ])
  assert.deepEqual(ids(sortJobs(records, 'best-match')), ['high', 'also-high', 'zero', 'unknown', 'missing'])
  assert.deepEqual(ids(searchRecords), ['unknown', 'zero', 'high'])
  assert.notEqual(sortJobs(records, 'best-match'), records)
})

test('deadline and newest sort strict calendar dates with stable ties and unknown dates last', () => {
  assert.equal(typeof sortJobs, 'function', 'The Browse sort helper must be implemented')
  const records = Object.freeze([
    Object.freeze({ id: 'rollover', deadline: '2026-02-31', postedAt: '2026-02-31' }),
    Object.freeze({ id: 'later', deadline: '2026-11-09', postedAt: '2026-11-09' }),
    Object.freeze({ id: 'earlier', deadline: '2026-11-02', postedAt: '2026-11-02' }),
    Object.freeze({ id: 'tie', deadline: '2026-11-09', postedAt: '2026-11-09' }),
    Object.freeze({ id: 'missing' }),
    Object.freeze({ id: 'invalid', deadline: 'not-a-date', postedAt: '2026-13-01' }),
    Object.freeze({ id: 'null', deadline: null, postedAt: null }),
  ])
  assert.deepEqual(ids(sortJobs(records, 'deadline')), ['earlier', 'later', 'tie', 'rollover', 'missing', 'invalid', 'null'])
  assert.deepEqual(ids(sortJobs(records, 'newest')), ['later', 'tie', 'earlier', 'rollover', 'missing', 'invalid', 'null'])
  assert.deepEqual(ids(records), ['rollover', 'later', 'earlier', 'tie', 'missing', 'invalid', 'null'])
  assert.deepEqual(sortJobs([], 'newest'), [])
})
