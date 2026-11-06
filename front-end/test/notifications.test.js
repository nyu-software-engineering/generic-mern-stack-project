
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mockResponse } from './fixtures.js'
import {
  loadMockData,
  updateRental,
  updateRentalStatus,
} from '../src/services/mockDataService.js'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from '../src/services/notifications.js'

test('notifications support rental events, links, and read state', async (t) => {
  // Simulate browser storage for persistence testing.
  const storage = new Map()
  const originalWindow = globalThis.window

  globalThis.window = {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  }

  t.after(() => {
    if (originalWindow === undefined) {
      delete globalThis.window
    } else {
      globalThis.window = originalWindow
    }
  })

  t.mock.method(
    globalThis,
    'fetch',
    async () => Response.json(mockResponse())
  )

  await loadMockData()

  const notifications = getNotifications('owner-1')

  assert.ok(notifications.length > 0)
  assert.ok(notifications.every((item) => !item.isRead))

  // Incoming rental requests link to the booking summary.
  const rentalRequest = notifications.find(
    (item) => item.id === 'rental-101-requested'
  )

  assert.ok(rentalRequest)
  assert.equal(rentalRequest.to, '/bookings/101')

  // Extension requests link directly to their details.
  const extension = notifications.find(
    (item) => item.id === 'rental-105-extension_requested'
  )

  assert.ok(extension)
  assert.equal(extension.to, '/bookings/105/extension')

  // Completed rentals link to reviews when eligible.
  const completed = notifications.find(
    (item) => item.id === 'rental-106-completed'
  )

  assert.ok(completed)
  assert.equal(completed.to, '/bookings/106/review')

  // Messages link to the actual conversation.
  const message = notifications.find(
    (item) => item.category === 'Message'
  )

  assert.ok(message)
  assert.equal(message.to, '/inbox?conversation=1')

  // Users should not receive notifications for unrelated rentals.
  assert.deepEqual(getNotifications('unknown-user'), [])

  // Individual read action.
  const initialUnread = getUnreadCount('owner-1')

  assert.equal(
    markNotificationRead(rentalRequest.id, 'owner-1'),
    true
  )

  assert.equal(
    getUnreadCount('owner-1'),
    initialUnread - 1
  )

  assert.equal(
    getNotifications('owner-1').find(
      (item) => item.id === rentalRequest.id
    ).isRead,
    true
  )

  // Read state is saved in browser storage.
  const savedReadIds = JSON.parse(
    storage.get('dormshare-notifications-read:owner-1')
  )

  assert.ok(savedReadIds.includes(rentalRequest.id))

  // Read state is isolated between users.
  assert.ok(
    getNotifications('student-2').every(
      (item) => !item.isRead
    )
  )

  // Unknown notification IDs are rejected.
  assert.equal(
    markNotificationRead('does-not-exist', 'owner-1'),
    false
  )

  assert.equal(
    markNotificationUnread('does-not-exist', 'owner-1'),
    false
  )

  // Mark an individual notification unread again.
  assert.equal(
    markNotificationUnread(rentalRequest.id, 'owner-1'),
    true
  )

  assert.equal(
    getUnreadCount('owner-1'),
    initialUnread
  )

  // Bulk read action.
  markAllNotificationsRead('owner-1')

  assert.equal(getUnreadCount('owner-1'), 0)

  assert.ok(
    getNotifications('owner-1').every(
      (item) => item.isRead
    )
  )

  // A booking status change creates a new notification.
  updateRentalStatus(101, 'confirmed')

  const updated = getNotifications('owner-1')

  assert.ok(
    updated.some(
      (item) =>
        item.id === 'rental-101-confirmed' &&
        !item.isRead
    )
  )

  assert.ok(
    !updated.some(
      (item) => item.id === 'rental-101-requested'
    )
  )

  // REGRESSION 1: Overdue alerts must have distinct read states.
  // Set a future return date to create a normal reminder.
  updateRental(104, {
    endDate: '2099-12-31',
  })

  const reminder = getNotifications('owner-1').find(
    (item) => item.id === 'rental-104-active'
  )

  assert.ok(reminder)
  assert.equal(reminder.title, 'Return reminder')

  // Mark the normal reminder as read.
  assert.equal(
    markNotificationRead(reminder.id, 'owner-1'),
    true
  )

  // Move the return date into the past.
  updateRental(104, {
    endDate: '2000-01-01',
  })

  const overdue = getNotifications('owner-1').find(
    (item) => item.id === 'rental-104-overdue'
  )

  assert.ok(overdue)
  assert.equal(overdue.title, 'Return overdue')
  assert.equal(overdue.isRead, false)
  assert.equal(overdue.to, '/bookings/104')

  // The old reminder ID must not be reused.
  assert.notEqual(reminder.id, overdue.id)

  // REGRESSION 2: Approved extensions notify the borrower.
  updateRental(105, {
    status: 'active',
    endDate: '2099-11-15',
    extensionRequest: {
      status: 'approved',
      newEndDate: '2099-11-15',
    },
  })

  const approved = getNotifications('student-2').find(
    (item) =>
      item.id === 'rental-105-extension-approved-2099-11-15'
  )

  assert.ok(approved)
  assert.equal(approved.title, 'Extension approved')
  assert.equal(approved.to, '/bookings/105/extension')
  assert.equal(approved.isRead, false)

  // The owner should not receive the borrower's decision alert.
  assert.ok(
    !getNotifications('owner-1').some(
      (item) => item.id === approved.id
    )
  )

  // Reading the approval should work normally.
  assert.equal(
    markNotificationRead(approved.id, 'student-2'),
    true
  )

  assert.equal(
    getNotifications('student-2').find(
      (item) => item.id === approved.id
    ).isRead,
    true
  )

  // REGRESSION 3: Declined extensions also notify the borrower.
  updateRental(105, {
    status: 'active',
    extensionRequest: {
      status: 'declined',
      newEndDate: '2099-11-16',
    },
  })

  const declined = getNotifications('student-2').find(
    (item) =>
      item.id === 'rental-105-extension-declined-2099-11-16'
  )

  assert.ok(declined)
  assert.equal(declined.title, 'Extension declined')
  assert.equal(declined.to, '/bookings/105/extension')
  assert.equal(declined.isRead, false)

  // Different extension outcomes must have different IDs.
  assert.notEqual(approved.id, declined.id)

  // The previous approval's read state must not hide a new decline.
  assert.equal(declined.isRead, false)

  // Owners do not receive the borrower's decision notification.
  assert.ok(
    !getNotifications('owner-1').some(
      (item) => item.id === declined.id
    )
  )
})
