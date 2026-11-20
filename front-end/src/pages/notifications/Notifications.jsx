import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from '../../services/notifications.js'
import '../../styles/trust.css'
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
    <main className="ds-page ds-trust notifications-page">
      <header className="trust-header notifications-header">
        <div>
          <h1 className="ds-heading">Notifications</h1>
          <p>Updates about your rentals, requests, and messages.</p>
        </div>

        <Link to="/browse" className="ds-text-link notifications-back">
          Back to Browse
        </Link>
      </header>

      <section
        className="notifications-panel"
        aria-label="Your notifications"
      >
        <div className="notifications-toolbar">
          <div
            className="notifications-filters"
            role="group"
            aria-label="Filter notifications"
          >
            <button
              type="button"
              className={
                filter === 'all'
                  ? 'ds-button ds-button--primary notifications-filter notifications-filter--active'
                  : 'ds-button ds-button--secondary notifications-filter'
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
                  ? 'ds-button ds-button--primary notifications-filter notifications-filter--active'
                  : 'ds-button ds-button--secondary notifications-filter'
              }
              aria-pressed={filter === 'unread'}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <button
            type="button"
            className="ds-button ds-button--secondary notifications-mark-all"
            disabled={unreadCount === 0}
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </button>
        </div>

        {visibleNotifications.length === 0 ? (
          <div className="trust-empty notifications-empty">
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
            {visibleNotifications.map((notification) => {
              const readAction = notification.isRead
                ? 'Mark as unread'
                : 'Mark as read'

              return (
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
                      <span className="ds-status notifications-unread-label">
                        <span
                          className="notifications-dot"
                          aria-hidden="true"
                        />
                        Unread
                      </span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="trust-meta notifications-category">
                    {notification.category}
                  </span>

                  <div className="notifications-actions">
                    <Link
                      to={notification.to}
                      className="ds-button ds-button--primary notifications-view"
                      aria-label={`View details for ${notification.title}`}
                      onClick={() => handleReadChange(notification.id, true)}
                    >
                      View details
                    </Link>

                    <button
                      type="button"
                      className="ds-button ds-button--secondary notifications-read-action"
                      aria-label={`${readAction} for ${notification.title}`}
                      onClick={() =>
                        handleReadChange(notification.id, !notification.isRead)
                      }
                    >
                      {readAction}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}

export default Notifications
