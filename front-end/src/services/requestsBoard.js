// Shared requests board service. The board calls getBoardRequests() instead of
// reading each request source itself, so new sources only need to be added here.
import { getOpenItemRequests } from './itemRequests.js'
import { CURRENT_USER_ID } from './mockDataService.js'
import { getQuickBorrowRequests } from './quickBorrow.js'

// Item requests use the same field names as quick borrow requests at a minimum:
// id, itemName, neededBy, approximateArea, details, createdAt.
export const REQUEST_TYPES = {
  quick: 'Quick borrow',
  item: 'Item request',
}

// type is 'all', a REQUEST_TYPES key, or 'mine'. 'mine' shows only your own
// requests; every other tab shows only other people's.
export function getBoardRequests(type = 'all', userId = CURRENT_USER_ID) {
  const isMine = (request) => request.requesterId === userId

  const requests = [
    ...getQuickBorrowRequests().map((request) => ({ ...request, type: 'quick' })),
    ...getOpenItemRequests().map((request) => ({ ...request, type: 'item' })),
  ]

  return requests
    .filter((request) =>
      type === 'mine'
        ? isMine(request)
        : !isMine(request) && (type === 'all' || request.type === type),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
