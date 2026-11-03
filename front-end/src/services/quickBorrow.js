// Quick Borrow service. Pages call these functions instead of touching storage
// directly, so they can later be swapped for backend requests.
// Requests are kept in localStorage so they survive a page refresh.
import { CURRENT_USER_ID } from './mockDataService.js'

// TODO: replace with the signed-in user from Context once #49 lands.
const STORAGE_KEY = 'dormshare.quickBorrowRequests'

function readAll() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

const getQuickBorrowRequests = () => readAll()

const getQuickBorrowRequestsForUser = (requesterId = CURRENT_USER_ID) =>
  readAll().filter((request) => request.requesterId === requesterId)

// Returns the saved request, or null if a required field is blank after trimming.
const createQuickBorrowRequest = ({
  itemName,
  neededBy,
  neededTime = '',
  borrowDuration,
  approximateArea,
  details,
  requesterId = CURRENT_USER_ID,
}) => {
  const trimmed = {
    itemName: itemName.trim(),
    borrowDuration: borrowDuration.trim(),
    approximateArea: approximateArea.trim(),
    details: details.trim(),
  }
  if (!neededBy || Object.values(trimmed).some((value) => !value)) return null

  const request = {
    id: `qb-${Date.now()}`,
    requesterId,
    ...trimmed,
    neededBy,
    neededTime,
    status: 'open',
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...readAll(), request]))
  return request
}

export { getQuickBorrowRequests, getQuickBorrowRequestsForUser, createQuickBorrowRequest }
