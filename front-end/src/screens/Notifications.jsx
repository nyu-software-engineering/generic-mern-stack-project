import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ScreenTitle from "../components/ui/ScreenTitle.jsx";
import { getNotifications } from "../data/api.js";

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  const openNotification = (notification) => {
    setNotifications(
      notifications.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ),
    );
    navigate(notification.link);
  };

  const markAllRead = () => {

    setNotifications(notifications.map((item) => ({ ...item, read: true })))
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <div>
      <ScreenTitle
        title="Notifications"
        subtitle={
          unreadCount > 0 ? `${unreadCount} unread` : "You are all caught up."
        }
      />
      {unreadCount > 0 && (
        <button type="button" onClick={markAllRead} className="mb-4 text-sm font-semibold text-accent hover:underline">
          Mark all as read
        </button>
      )}
      <ul className="divide-y divide-line border-y border-line">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => openNotification(notification)}
              className={`flex w-full gap-3 py-4 text-left transition hover:bg-canvas ${
                notification.read
                  ? ""
                  : "border-l-4 border-accent bg-accent-soft pl-3"
              }`}
            >
              <div className="flex-1">
                <p
                  className={
                    notification.read ? "text-ink" : "font-semibold text-ink"
                  }
                >
                  {notification.title}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {notification.message}
                </p>
              </div>
              <span className="shrink-0 pr-2 text-xs text-muted">
                {formatDate(notification.createdAt)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
