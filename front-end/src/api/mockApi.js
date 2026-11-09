/*
 * Mock back-end for Sprint 1.
 *
 * Applications and events are fetched from the JSON files in public/mock-data/ and kept in
 * memory, so creating, editing and deleting work while the app is open (reloading resets them).
 *
 * Accounts and the login session are saved in the browser (localStorage), so signing up,
 * logging in, changing your password and deleting your account behave like a real app and
 * survive a reload. Demo account: alex.morgan@university.example / password123
 *
 * Every function is async and returns copies of the data, exactly like a real API would.
 * In Sprint 2 the bodies of these functions will be replaced with calls to our Express
 * back-end; pages that use `api.*` won't need to change.
 */

import { FINAL_STATUSES, getLabel, getStatus, JOB_TYPES } from '../constants'
import { formatDate, todayString } from '../utils/format'
import { createTextPdf } from '../utils/pdf'

const FAKE_DELAY_MS = 250 // simulate network time so loading states are visible

const wait = (ms = FAKE_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))
const copy = (value) => structuredClone(value)
const newId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`
const normalize = (text = '') => text.trim().toLowerCase()

let store = null

async function fetchJson(file) {
  const response = await fetch(`/mock-data/${file}`)
  if (!response.ok) throw new Error(`Could not load mock data: ${file}`)
  return response.json()
}

// Load applications and events once, the first time any api function needs them.
async function getStore() {
  if (!store) {
    const [applications, events] = await Promise.all([fetchJson('applications.json'), fetchJson('events.json')])
    store = { applications, events }
  }
  await wait()
  return store
}

function findApplication(data, id) {
  const application = data.applications.find((item) => item.id === id)
  if (!application) throw new Error('Application not found')
  return application
}

function findEvent(data, id) {
  const event = data.events.find((item) => item.id === id)
  if (!event) throw new Error('Event not found')
  return event
}

function findInterviewEventForRound(data, { applicationId, roundId, roundName, roundDate }) {
  return (
    data.events.find(
      (event) => event.applicationId === applicationId && roundId && event.roundId === roundId,
    ) ||
    data.events.find(
      (event) =>
        event.applicationId === applicationId &&
        event.type === 'interview' &&
        event.title === roundName &&
        event.date === roundDate,
    ) ||
    null
  )
}

function findInterviewRoundForEvent(data, event) {
  if (event.type !== 'interview' || !event.applicationId) return null

  const application = data.applications.find((item) => item.id === event.applicationId)
  if (!application) return null

  const round =
    application.interviewRounds.find((item) => event.roundId && item.id === event.roundId) ||
    application.interviewRounds.find(
      (item) => item.name === event.title && item.date === event.date,
    ) ||
    null

  return round ? { application, round } : null
}

/* ===================== Saved accounts and session ===================== */

const ACCOUNTS_KEY = 'applytrack-mock-accounts'
const SESSION_KEY = 'applytrack-session'
const RESET_KEY = 'applytrack-password-reset'
const DEMO_PASSWORD = 'password123'

const DEFAULT_NOTIFICATION_SETTINGS = {
  deadlineReminders: true,
  interviewReminders: true,
  followUpReminders: true,
  defaultReminder: '1-day',
}

function readStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new Error("Couldn't save. Your browser storage may be full or turned off.")
  }
}

// The first time, start with the demo account from user.json.
async function getAccounts() {
  const saved = readStorage(ACCOUNTS_KEY)
  if (saved) return saved
  const demoUser = await fetchJson('user.json')
  const accounts = [{ ...demoUser, password: DEMO_PASSWORD }]
  writeStorage(ACCOUNTS_KEY, accounts)
  return accounts
}

function saveAccounts(accounts) {
  writeStorage(ACCOUNTS_KEY, accounts)
}

// Never send the password back to the page.
function toPublicUser(account) {
  const user = copy(account)
  delete user.password
  return user
}

/** True if someone is logged in on this device (synchronous, used when the app starts). */
function hasSession() {
  return Boolean(readStorage(SESSION_KEY))
}

async function getLoggedInAccount(accounts) {
  const email = readStorage(SESSION_KEY)
  const account = email && accounts.find((item) => normalize(item.email) === normalize(email))
  if (!account) {
    writeStorage(SESSION_KEY, null)
    throw new Error('You are not logged in')
  }
  return account
}

/* ===================== Auth ===================== */

async function logIn({ email, password } = {}) {
  await wait()
  const accounts = await getAccounts()
  const account = accounts.find((item) => normalize(item.email) === normalize(email))
  if (!account) throw new Error('No account found with that email')
  if (account.password !== password) throw new Error('Incorrect password')
  writeStorage(SESSION_KEY, account.email)
  return toPublicUser(account)
}

async function signUp({ fullName, email, password } = {}) {
  await wait()
  const accounts = await getAccounts()
  if (accounts.some((item) => normalize(item.email) === normalize(email))) {
    throw new Error('An account with this email already exists')
  }
  const account = {
    id: newId('user'),
    fullName: fullName.trim(),
    email: email.trim(),
    password,
    avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(normalize(email))}/200/200`,
    notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS },
  }
  saveAccounts([...accounts, account])
  writeStorage(SESSION_KEY, account.email)
  return toPublicUser(account)
}

async function logOut() {
  await wait()
  writeStorage(SESSION_KEY, null)
  return { ok: true }
}

/**
 * Pretends to email a reset link. For the demo, the next resetPassword() call applies to this email.
 * Like real apps, it doesn't reveal whether the email has an account.
 */
async function requestPasswordReset({ email } = {}) {
  await wait()
  writeStorage(RESET_KEY, email.trim())
  return { ok: true }
}

/** Sets a new password for the email used in requestPasswordReset(). */
async function resetPassword({ newPassword } = {}) {
  await wait()
  const email = readStorage(RESET_KEY)
  const accounts = await getAccounts()
  const account = email && accounts.find((item) => normalize(item.email) === normalize(email))
  if (!account) {
    throw new Error('This reset link is invalid or has expired. Request a new one from the Forgot Password page.')
  }
  account.password = newPassword
  saveAccounts(accounts)
  writeStorage(RESET_KEY, null)
  return { ok: true }
}

/* ===================== Current user ===================== */

async function getCurrentUser() {
  await wait()
  const accounts = await getAccounts()
  return toPublicUser(await getLoggedInAccount(accounts))
}

/** Update fullName, email and/or avatarUrl. */
async function updateCurrentUser(changes) {
  await wait()
  const accounts = await getAccounts()
  const account = await getLoggedInAccount(accounts)
  if (changes.email && normalize(changes.email) !== normalize(account.email)) {
    if (accounts.some((item) => normalize(item.email) === normalize(changes.email))) {
      throw new Error('Another account already uses this email')
    }
  }
  const { fullName, email, avatarUrl } = changes
  Object.assign(account, {
    ...(fullName !== undefined && { fullName: fullName.trim() }),
    ...(email !== undefined && { email: email.trim() }),
    ...(avatarUrl !== undefined && { avatarUrl }),
  })
  saveAccounts(accounts)
  writeStorage(SESSION_KEY, account.email)
  return toPublicUser(account)
}

async function changePassword({ currentPassword, newPassword }) {
  await wait()
  const accounts = await getAccounts()
  const account = await getLoggedInAccount(accounts)
  if (account.password !== currentPassword) throw new Error('Current password is incorrect')
  account.password = newPassword
  saveAccounts(accounts)
  return { ok: true }
}

async function deleteAccount() {
  await wait()
  const accounts = await getAccounts()
  const account = await getLoggedInAccount(accounts)
  saveAccounts(accounts.filter((item) => item !== account))
  writeStorage(SESSION_KEY, null)
  return { ok: true }
}

async function getNotificationSettings() {
  await wait()
  const accounts = await getAccounts()
  const account = await getLoggedInAccount(accounts)
  return copy({ ...DEFAULT_NOTIFICATION_SETTINGS, ...account.notificationSettings })
}

async function updateNotificationSettings(changes) {
  await wait()
  const accounts = await getAccounts()
  const account = await getLoggedInAccount(accounts)
  account.notificationSettings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...account.notificationSettings, ...changes }
  saveAccounts(accounts)
  return copy(account.notificationSettings)
}

/* ===================== Applications ===================== */

/** All applications. Archived ones are left out unless { includeArchived: true } is passed. */
async function getApplications({ includeArchived = false } = {}) {
  const data = await getStore()
  return copy(data.applications.filter((item) => includeArchived || !item.archived))
}

async function getArchivedApplications() {
  const data = await getStore()
  return copy(data.applications.filter((item) => item.archived))
}

async function getApplication(id) {
  const data = await getStore()
  return copy(findApplication(data, id))
}

async function createApplication(fields) {
  const data = await getStore()
  const status = fields.status ?? 'applied'
  const application = {
    location: '',
    jobType: 'internship',
    jobPostingUrl: '',
    logoUrl: `https://picsum.photos/seed/${encodeURIComponent(fields.company ?? 'company')}/96/96`,
    recruiters: [],
    resume: null,
    notes: '',
    interviewRounds: [],
    offer: null,
    ...fields,
    id: newId('app'),
    status,
    dateApplied: fields.dateApplied || todayString(),
    archived: false,
    statusHistory: [{ status, date: todayString() }],
  }
  data.applications.unshift(application)
  return copy(application)
}

/** Update any fields. Changing `status` automatically adds an entry to `statusHistory`. */
async function updateApplication(id, changes) {
  const data = await getStore()
  const application = findApplication(data, id)
  if (changes.status && changes.status !== application.status) {
    application.statusHistory.push({ status: changes.status, date: todayString() })
  }
  Object.assign(application, changes, { id })
  return copy(application)
}

async function deleteApplication(id) {
  const data = await getStore()
  findApplication(data, id)
  data.applications = data.applications.filter((item) => item.id !== id)
  data.events = data.events.filter((event) => event.applicationId !== id)
  return { ok: true }
}

async function archiveApplication(id) {
  return updateApplication(id, { archived: true })
}

async function unarchiveApplication(id) {
  return updateApplication(id, { archived: false })
}

/** Returns an existing application with the same company and position (ignoring case and spaces), or null. */
async function findDuplicateApplication({ company, position }) {
  const data = await getStore()
  const match = data.applications.find(
    (item) => normalize(item.company) === normalize(company) && normalize(item.position) === normalize(position),
  )
  return match ? copy(match) : null
}

/* ===================== Offer details ===================== */

async function saveOffer(applicationId, offer) {
  const data = await getStore()
  const application = findApplication(data, applicationId)
  application.offer = { ...application.offer, ...offer }
  return copy(application)
}

/* ===================== Interview rounds ===================== */

async function addInterviewRound(applicationId, round) {
  const data = await getStore()
  const application = findApplication(data, applicationId)
  const saved = { ...round, id: newId('round') }
  application.interviewRounds.push(saved)
  return copy(saved)
}

async function updateInterviewRound(applicationId, roundId, changes) {
  const data = await getStore()
  const application = findApplication(data, applicationId)
  const round = application.interviewRounds.find((item) => item.id === roundId)
  if (!round) throw new Error('Interview round not found')
  Object.assign(round, changes, { id: roundId })
  return copy(round)
}

async function deleteInterviewRound(applicationId, roundId) {
  const data = await getStore()
  const application = findApplication(data, applicationId)
  const round = application.interviewRounds.find((item) => item.id === roundId)
  if (!round) throw new Error('Interview round not found')

  const linkedEvent = findInterviewEventForRound(data, {
    applicationId,
    roundId,
    roundName: round.name,
    roundDate: round.date,
  })

  application.interviewRounds = application.interviewRounds.filter((item) => item.id !== roundId)

  if (linkedEvent) {
    data.events = data.events.filter((event) => event.id !== linkedEvent.id)
  }

  return { ok: true }
}

/* ===================== Events (deadlines, interviews, follow-ups) ===================== */

/** All events, soonest first. Pass { applicationId } to get only one application's events. */
async function getEvents({ applicationId } = {}) {
  const data = await getStore()
  return copy(
    data.events
      .filter((event) => !applicationId || event.applicationId === applicationId)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
  )
}

async function getEvent(id) {
  const data = await getStore()
  return copy(findEvent(data, id))
}

async function createEvent(fields) {
  const data = await getStore()
  const event = { notes: '', reminder: { enabled: false, before: '1-day' }, ...fields, id: newId('event') }
  data.events.push(event)
  return copy(event)
}

async function updateEvent(id, changes) {
  const data = await getStore()
  const event = findEvent(data, id)
  Object.assign(event, changes, { id })
  return copy(event)
}

async function deleteEvent(id) {
  const data = await getStore()
  const event = findEvent(data, id)
  const linkedRound = findInterviewRoundForEvent(data, event)

  if (linkedRound) {
    linkedRound.application.interviewRounds = linkedRound.application.interviewRounds.filter(
      (round) => round.id !== linkedRound.round.id,
    )
  }

  data.events = data.events.filter((event) => event.id !== id)
  return { ok: true }
}

/* ===================== Statistics ===================== */

async function getStatistics() {
  const data = await getStore()
  const active = data.applications.filter((item) => !item.archived)
  const countByStatus = {}
  for (const item of active) countByStatus[item.status] = (countByStatus[item.status] ?? 0) + 1

  const responded = active.filter((item) => item.status !== 'applied').length
  return {
    totalApplied: active.length,
    active: active.filter((item) => !FINAL_STATUSES.includes(item.status)).length,
    interviews: active.filter((item) => ['interview', 'offer'].includes(item.status)).length,
    offers: countByStatus.offer ?? 0,
    rejections: countByStatus.rejected ?? 0,
    responseRate: active.length ? Math.round((responded / active.length) * 100) : 0,
    countByStatus,
  }
}

/* ===================== Export ===================== */

const EXPORT_COLUMNS = [
  { header: 'Company', value: (item) => item.company },
  { header: 'Position', value: (item) => item.position },
  { header: 'Location', value: (item) => item.location },
  { header: 'Job type', value: (item) => getLabel(JOB_TYPES, item.jobType) },
  { header: 'Status', value: (item) => getStatus(item.status).label },
  { header: 'Date applied', value: (item) => item.dateApplied },
  { header: 'Archived', value: (item) => (item.archived ? 'Yes' : 'No') },
  { header: 'Job posting', value: (item) => item.jobPostingUrl },
  { header: 'Recruiter', value: (item) => item.recruiters?.[0]?.name ?? '' },
  { header: 'Recruiter email', value: (item) => item.recruiters?.[0]?.email ?? '' },
  { header: 'Resume used', value: (item) => item.resume?.fileName ?? '' },
  { header: 'Notes', value: (item) => item.notes },
]

function buildCsv(applications) {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const rows = applications.map((item) => EXPORT_COLUMNS.map((column) => escape(column.value(item))).join(','))
  // \uFEFF tells Excel the file is UTF-8, so accented names display correctly
  return '\uFEFF' + [EXPORT_COLUMNS.map((column) => escape(column.header)).join(','), ...rows].join('\r\n')
}

function buildPdf(applications) {
  const lines = [
    { text: 'ApplyTrack - Applications', bold: true, size: 16 },
    { text: `Exported ${formatDate(todayString())} - ${applications.length} applications` },
    { text: '' },
  ]
  for (const item of applications) {
    lines.push({ text: `${item.company} - ${item.position}`, bold: true, size: 11 })
    lines.push({
      text: `${getStatus(item.status).label} - applied ${formatDate(item.dateApplied)}${item.archived ? ' - archived' : ''}`,
    })
    const details = [item.location, getLabel(JOB_TYPES, item.jobType)].filter(Boolean).join(' - ')
    if (details) lines.push({ text: details })
    if (item.jobPostingUrl) lines.push({ text: item.jobPostingUrl })
    if (item.notes) lines.push({ text: `Notes: ${item.notes}` })
    lines.push({ text: '' })
  }
  return createTextPdf(lines)
}

/**
 * Builds the export file.
 * Returns { fileName, mimeType, content, count }; pass it to downloadFile() from utils/files.js.
 */
async function exportApplications({ format = 'csv', includeArchived = false } = {}) {
  const applications = await getApplications({ includeArchived })
  const fileName = `applytrack-applications-${todayString()}.${format}`
  if (format === 'pdf') {
    return { fileName, mimeType: 'application/pdf', content: buildPdf(applications), count: applications.length }
  }
  return { fileName, mimeType: 'text/csv', content: buildCsv(applications), count: applications.length }
}

export const mockApi = {
  // auth
  hasSession,
  logIn,
  signUp,
  logOut,
  requestPasswordReset,
  resetPassword,
  // user
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  deleteAccount,
  getNotificationSettings,
  updateNotificationSettings,
  // applications
  getApplications,
  getArchivedApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  archiveApplication,
  unarchiveApplication,
  findDuplicateApplication,
  saveOffer,
  addInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
  // events
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  // statistics and export
  getStatistics,
  exportApplications,
}
