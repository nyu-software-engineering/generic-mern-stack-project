// Shared requests board service. The board calls getBoardRequests() instead of
// reading each request source itself, so new sources only need to be added here.
import { getQuickBorrowRequests } from './quickBorrow.js'

// todo @Yutong :- add item requests once their service exists, e.g.
//   import { getItemRequests } from './itemRequests.js'
//   ...getItemRequests().map((request) => ({ ...request, type: 'item' })),

// Item requests should use the same field names as quick borrow requests at a minimum:
// id, itemName, neededBy, approximateArea, details, createdAt.
export const REQUEST_TYPES = {
  quick: 'Quick borrow',
  item: 'Item request',
}

export function getBoardRequests(type = 'all') {
  const requests = [
    ...getQuickBorrowRequests().map((request) => ({ ...request, type: 'quick' })),
  ]

  return requests
    .filter((request) => type === 'all' || request.type === type)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
