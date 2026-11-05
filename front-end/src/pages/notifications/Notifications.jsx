
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from '../../services/notifications.js'
import './notifications.css'

function Notifications() {
  const [notifications, setNotifications] = useState(
    () => getNotifications()
  )
  const [filter, setFilter] = useState('all')

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length

  const visibleNotifications = notifications.filter(
    (notification) =>
      filter === 'all' || !notification.isRead
  )

  function handleReadChange(id, shouldRead) {
    if (shouldRead) {
      markNotificationRead(id)
    } else {
      markNotificationUnread(id)
    }

    setNotifications(getNotifications())
  }

  function handleMarkAllRead() {
    setNotifications(markAllNotificationsRead())
  }

  return (
    <main className="notifications-page">
      <header className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Updates about your rentals, requests, and messages.</p>
        </div>

        <Link to="/browse" className="notifications-back">
          Back to Browse
        </Link>
      </header>

      <section className="notifications-panel" aria-label="Your notifications">
        <div className="notifications-toolbar">
          <div
            className="notifications-filters"
            aria-label="Filter notifications"
          >
            <button
              type="button"
              className={
                filter === 'all'
                  ? 'notifications-filter notifications-filter--active'
                  : 'notifications-filter'
              }
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>

            <button
              type="button"
              className={
                filter === 'unread'
                  ? 'notifications-filter notifications-filter--active'
                  : 'notifications-filter'
              }
              aria-pressed={filter === 'unread'}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <button
            type="button"
            className="notifications-mark-all"
            disabled={unreadCount === 0}
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </button>
        </div>

        {visibleNotifications.length === 0 ? (
          <div className="notifications-empty">
            <h2>
              {filter === 'unread'
                ? "You're all caught up!"
                : 'No notifications yet'}
            </h2>
            <p>
              {filter === 'unread'
                ? 'You have no unread notifications.'
                : 'Your DormShare updates will appear here.'}
            </p>
          </div>
        ) : (
          <ul className="notifications-list">
            {visibleNotifications.map((notification) => (
              <li
                key={notification.id}
                className={
                  notification.isRead
                    ? 'notifications-item'
                    : 'notifications-item notifications-item--unread'
                }
              >
                <div className="notifications-item-header">
                  <h2>{notification.title}</h2>

                  {!notification.isRead && (
                    <span className="notifications-unread-label">
                      <span
                        className="notifications-dot"
                        aria-hidden="true"
                      />
                      Unread
                    </span>
                  )}
                </div>

                <p>{notification.message}</p>

                <span className="notifications-category">
                  {notification.category}
                </span>

                <div className="notifications-actions">
                  <Link
                    to={notification.to}
                    className="notifications-view"
                    onClick={() =>
                      handleReadChange(notification.id, true)
                    }
                  >
                    View details
                  </Link>

                  <button
                    type="button"
                    className="notifications-read-action"
                    onClick={() =>
                      handleReadChange(
                        notification.id,
                        !notification.isRead
                      )
                    }
                  >
                    {notification.isRead
                      ? 'Mark as unread'
                      : 'Mark as read'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="notifications-footnote">
        Notifications reflect your current DormShare rental and message activity.
      </p>
    </main>
  )
}

export default Notifications
