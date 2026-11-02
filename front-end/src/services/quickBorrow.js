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

const createQuickBorrowRequest = ({
  itemName,
  neededBy,
  borrowDuration,
  approximateArea,
  details,
  requesterId = CURRENT_USER_ID,
}) => {
  const request = {
    id: `qb-${Date.now()}`,
    requesterId,
    itemName: itemName.trim(),
    neededBy,
    borrowDuration: borrowDuration.trim(),
    approximateArea: approximateArea.trim(),
    details: details.trim(),
    status: 'open',
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...readAll(), request]))
  return request
}

export { getQuickBorrowRequests, getQuickBorrowRequestsForUser, createQuickBorrowRequest }
