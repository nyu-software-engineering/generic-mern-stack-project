
import {
  CURRENT_USER_ID,
  getConversations,
  getListings,
  getRentals,
  getReviews,
  getUser,
} from './mockDataService.js'
import { formatDate, isOverdue } from './bookings.js'

const readByUser = new Map()
const sameId = (a, b) => String(a) === String(b)
const storageKey = (userId) => `dormshare-notifications-read:${userId}`

function readIdsFor(userId) {
  const key = String(userId)

  if (!readByUser.has(key)) {
    let savedIds = []

    try {
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(
          window.localStorage.getItem(storageKey(key)) ?? '[]'
        )

        if (Array.isArray(stored)) {
          savedIds = stored.filter((id) => typeof id === 'string')
        }
      }
    } catch {
      // Notifications still work if browser storage is unavailable.
    }

    readByUser.set(key, new Set(savedIds))
  }

  return readByUser.get(key)
}

function persistReadIds(userId) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        storageKey(String(userId)),
        JSON.stringify([...readIdsFor(userId)])
      )
    }
  } catch {
    // Keep read state in memory if browser storage is disabled.
  }
}

function rentalNotification(rental, userId, titles, reviews) {
  const isOwner = sameId(rental.ownerId, userId)
  const isBorrower = sameId(rental.borrowerId, userId)

  if (!isOwner && !isBorrower) return null

  const otherId = isOwner ? rental.borrowerId : rental.ownerId
  const otherName = getUser(otherId)?.name ?? 'Another student'
  const item = titles.get(rental.listingId) ?? 'an item'
  const bookingLink = `/bookings/${rental.id}`
  const overdue = rental.status === 'active' && isOverdue(rental)

  let title
  let message
  let to = bookingLink
  let priority

  switch (rental.status) {
    case 'requested':
      if (!isOwner) return null
      title = 'New rental request'
      message = `${otherName} wants to borrow ${item}. Review the request.`
      priority = 5
      break

    case 'declined':
      if (!isBorrower) return null
      title = 'Rental request declined'
      message = `Your request for ${item} was declined.`
      priority = 2
      break

    case 'confirmed':
      title = 'Booking confirmed'
      message = `Your booking for ${item} is confirmed. Arrange pickup with ${otherName}.`
      priority = 3
      break

    case 'active':
      if (overdue) {
        title = 'Return overdue'
        message = `${item} was due on ${formatDate(rental.endDate)}. Coordinate the return.`
        priority = 6
      } else {
        title = 'Return reminder'
        message = `${item} is due back on ${formatDate(rental.endDate)}.`
        priority = 3
      }
      break

    case 'extension_requested':
      title = isOwner
        ? 'Extension request received'
        : 'Extension request pending'

      message = isOwner
        ? `${otherName} wants more time with ${item}. Review the extension.`
        : `Your extension request for ${item} is waiting for a response.`

      to = `/bookings/${rental.id}/extension`
      priority = isOwner ? 5 : 3
      break

    case 'completed': {
      const reviewed = reviews.some(
        (review) =>
          sameId(review.bookingId, rental.id) &&
          sameId(review.reviewerId, userId)
      )

      title = 'Rental completed'
      message = reviewed
        ? `Your rental for ${item} is complete.`
        : `Your rental for ${item} is complete. Leave a review.`

      if (!reviewed) to = `/bookings/${rental.id}/review`
      priority = 2
      break
    }

    case 'cancelled':
      title = 'Booking cancelled'
      message = `Your booking for ${item} has been cancelled.`
      priority = 2
      break

    default:
      return null
  }

  return {
    id: `rental-${rental.id}-${overdue ? 'overdue' : rental.status}`,
    title,
    message,
    to,
    category: 'Rental',
    priority,
    order: Number(rental.id),
  }
}


function extensionOutcomeNotification(rental, userId, titles) {
  const status = rental.extensionRequest?.status

  if (
    rental.status !== 'active' ||
    !sameId(rental.borrowerId, userId) ||
    !['approved', 'declined'].includes(status)
  ) {
    return null
  }

  const item = titles.get(rental.listingId) ?? 'an item'
  const newEndDate = rental.extensionRequest.newEndDate
  const approved = status === 'approved'

  return {
    id: `rental-${rental.id}-extension-${status}-${newEndDate}`,
    title: approved ? 'Extension approved' : 'Extension declined',
    message: approved
      ? `Your extension for ${item} was approved. New return date: ${formatDate(newEndDate)}.`
      : `Your extension request for ${item} was declined.`,
    to: `/bookings/${rental.id}/extension`,
    category: 'Rental',
    priority: 5,
    order: Number(rental.id),
  }
}


function generateNotifications(userId) {
  const titles = new Map(
    getListings().map((listing) => [listing.id, listing.title])
  )
  const reviews = getReviews()

  const rentals = getRentals().flatMap((rental) =>
    [
      rentalNotification(rental, userId, titles, reviews),
      extensionOutcomeNotification(rental, userId, titles),
    ] .filter(Boolean)
  )

  const messages = getConversations().flatMap((conversation) => {
    const participates = conversation.participantIds.some(
      (id) => sameId(id, userId)
    )

    if (!participates) return []

    const last = conversation.messages.at(-1)

    // Notify only when the latest message is from another student.
    if (!last || sameId(last.senderId, userId)) return []

    const sender = getUser(last.senderId)?.name ?? 'Another student'
    const item = titles.get(conversation.listingId) ?? 'an item'
    const isOffer = last.type === 'offer'

    return [{
      id: `message-${conversation.id}-${last.id}`,
      title: isOffer ? 'Offer received' : 'New message',
      message: `${sender} sent ${isOffer ? 'an offer' : 'a message'} about ${item}.`,
      to: `/inbox?conversation=${conversation.id}`,
      category: 'Message',
      priority: 4,
      order: Number(last.id),
    }]
  })

  // Actionable notifications appear before informational updates.
  return [...rentals, ...messages].sort(
    (a, b) => b.priority - a.priority || b.order - a.order
  )
}

export function getNotifications(userId = CURRENT_USER_ID) {
  const readIds = readIdsFor(userId)

  return generateNotifications(userId).map((notification) => ({
    ...notification,
    isRead: readIds.has(notification.id),
  }))
}

export function getUnreadCount(userId = CURRENT_USER_ID) {
  return getNotifications(userId)
    .filter((notification) => !notification.isRead)
    .length
}

export function markNotificationRead(id, userId = CURRENT_USER_ID) {
  const exists = generateNotifications(userId)
    .some((notification) => notification.id === id)

  if (!exists) return false

  readIdsFor(userId).add(id)
  persistReadIds(userId)
  return true
}

export function markNotificationUnread(id, userId = CURRENT_USER_ID) {
  const exists = generateNotifications(userId)
    .some((notification) => notification.id === id)

  if (!exists) return false

  readIdsFor(userId).delete(id)
  persistReadIds(userId)
  return true
}

export function markAllNotificationsRead(userId = CURRENT_USER_ID) {
  const readIds = readIdsFor(userId)

  for (const notification of generateNotifications(userId)) {
    readIds.add(notification.id)
  }

  persistReadIds(userId)
  return getNotifications(userId)
}
