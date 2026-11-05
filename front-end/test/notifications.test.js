
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mockResponse } from './fixtures.js'
import {
  loadMockData,
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

  // Incoming rental requests open the booking summary.
  const rentalRequest = notifications.find(
    (item) => item.id === 'rental-101-requested'
  )

  assert.ok(rentalRequest)
  assert.equal(rentalRequest.to, '/bookings/101')

  // Owners can open extension requests directly.
  const extension = notifications.find(
    (item) => item.id === 'rental-105-extension_requested'
  )

  assert.ok(extension)
  assert.equal(extension.to, '/bookings/105/extension')

  // Completed rentals link to a review form when eligible.
  const completed = notifications.find(
    (item) => item.id === 'rental-106-completed'
  )

  assert.ok(completed)
  assert.equal(completed.to, '/bookings/106/review')

  // Incoming messages lead to the actual conversation.
  const message = notifications.find(
    (item) => item.category === 'Message'
  )

  assert.ok(message)
  assert.equal(message.to, '/inbox?conversation=1')

  // Only a rental participant receives its notification.
  assert.deepEqual(getNotifications('unknown-user'), [])

  // Mark one notification as read.
  const initialUnread = getUnreadCount('owner-1')

  assert.equal(markNotificationRead(rentalRequest.id, 'owner-1'), true)
  assert.equal(getUnreadCount('owner-1'), initialUnread - 1)

  assert.equal(
    getNotifications('owner-1').find(
      (item) => item.id === rentalRequest.id
    ).isRead,
    true
  )

  // The read ID should be saved in browser storage.
  const savedReadIds = JSON.parse(
    storage.get('dormshare-notifications-read:owner-1')
  )

  assert.ok(savedReadIds.includes(rentalRequest.id))

  // Other students' read state is independent.
  assert.ok(
    getNotifications('student-2').every((item) => !item.isRead)
  )

  // Invalid notification IDs cannot be modified.
  assert.equal(markNotificationRead('does-not-exist', 'owner-1'), false)
  assert.equal(markNotificationUnread('does-not-exist', 'owner-1'), false)

  // Users can mark an individual notification unread again.
  assert.equal(markNotificationUnread(rentalRequest.id, 'owner-1'), true)
  assert.equal(getUnreadCount('owner-1'), initialUnread)

  // Mark all notifications as read.
  markAllNotificationsRead('owner-1')

  assert.equal(getUnreadCount('owner-1'), 0)
  assert.ok(
    getNotifications('owner-1').every((item) => item.isRead)
  )

  // Changing a booking status creates a new notification.
  updateRentalStatus(101, 'confirmed')

  const updated = getNotifications('owner-1')

  assert.ok(updated.some(
    (item) =>
      item.id === 'rental-101-confirmed' &&
      !item.isRead
  ))

  assert.ok(!updated.some(
    (item) => item.id === 'rental-101-requested'
  ))
})
