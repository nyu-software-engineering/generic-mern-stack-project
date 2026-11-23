import './Notifications.css'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const callApi = (url, options) =>
    fetch(url, options).then(res => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
    })

const Notifications = ({ notifications, setNotifications }) => {
    const [error, setError] = useState('')
    const unreadCount = notifications.filter(n => !n.read).length

    // load the latest notifications from the back-end each time this screen opens
    useEffect(() => {
        callApi('/api/notifications')
            .then(data => setNotifications(data))
            .catch(() => setError('Could not load notifications. Try again.'))
    }, [setNotifications])

    const markAllRead = () => {
        callApi('/api/notifications/read-all', { method: 'PATCH' })
            .then(data => setNotifications(data))
            .catch(() => setError('Could not reach the server. Try again.'))
    }

    const markRead = id => {
        callApi(`/api/notifications/${id}/read`, { method: 'PATCH' })
            .then(updated => setNotifications(prev => prev.map(n =>
                String(n.id) === String(updated.id) ? updated : n
            )))
            .catch(() => setError('Could not reach the server. Try again.'))
    }

    return (
        <div className="notifications">
            <h1>Notifications</h1>

            <div className="notificationHeader">
                <p>{unreadCount} unread</p>
                <button onClick={markAllRead} disabled={unreadCount === 0}>
                    Mark all as read
                </button>
            </div>
            {error && <p className="notificationError">{error}</p>}
            <div className="notificationList">
                {notifications.length === 0 && (
                    <p>No notifications yet.</p>
                )}

                {notifications.map(n => (
                    <div className="notificationItem" key={n.id}>
                        <img
                            className="notificationImage"
                            src={n.pfp}
                            alt=""
                        />

                        <div className="notificationContent">
                            <h3>{n.title}</h3>
                            <p>{n.description}</p>
                            <span>
                                {n.time} · {n.read ? 'Read' : 'Unread'}
                            </span>
                            <Link
                                to={n.path}
                                onClick={() => markRead(n.id)}
                            >
                                {n.link}
                            </Link>
                        </div>

                        {!n.read && <div className="unreadDot"></div>}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Notifications
