// later to be replaced with real backend
// survives refresh
import { CURRENT_USER_ID } from './mockDataService.js'

const STORAGE_KEY = 'dormshare.reports'

export const REPORT_REASONS = ['Damage', 'Missing item', 'Unsafe listing', 'Other']

function readAll() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export const getReport = (id) => readAll().find((report) => report.id === id)

// Returns the saved report, or null if the reason is invalid or the description is blank.
export function createReport({ rentalId = '', reason, description, imageName = '', reporterId = CURRENT_USER_ID }) {
  const trimmed = description.trim()
  if (!REPORT_REASONS.includes(reason) || !trimmed) return null

  const reports = readAll()
  const report = {
    id: `DS-${reports.length + 101}`,
    reporterId,
    rentalId: String(rentalId),
    reason,
    description: trimmed,
    imageName,
    status: 'awaiting moderator review',
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...reports, report]))
  return report
}
