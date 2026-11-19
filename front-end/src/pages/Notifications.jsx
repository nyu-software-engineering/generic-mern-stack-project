import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import arrowBack from "../assets/arrow-back-40px.svg";

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Flyer Posted",
      message: "Tech Club added a new flyer.",
      time: "10m ago",
    },
    {
      id: "2",
      title: "Admin Request Approved",
      message: "You can now edit Film Society.",
      time: "2h ago",
    },
    {
      id: "3",
      title: "Reminder",
      message: "Robotics Club meeting today at 5.",
      time: "Yesterday",
    },
  ]);

  function goBack() {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }
    navigate("/organizations");
  }

  function clearAll() {
    setNotifications([]);
  }

  return (
    <section className="flex flex-1 flex-col bg-(--parchment) p-8 pb-26 text-(--soft-black) rounded-4xl inset-shadow-sm shadow-[0px_-3px_8px_rgba(0,0,0,0.25)] mt-3">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between gap-3">
          <h1 className="heading">Notifications</h1>
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)"
          >
            <img src={arrowBack} alt="" className="size-8 brightness-0" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="body-copy underline underline-offset-4"
            >
              Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="mt-6 rounded-2xl p-8 text-center">
            <p className="body-copy">No notifications.</p>
            <Link
              to="/organizations"
              className="body-copy mt-4 inline-block underline underline-offset-4"
            >
              Back to organizations
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3 text-(--soft-black)">
            {notifications.map((item) => (
              <div key={item.id} className="bg-(--paper) p-6 inset-shadow-sm shadow-sm">
                <div className="flex justify-between">
                  <p className="feature-copy">{item.title}</p>
                  <span className="body-copy opacity-60">
                    {item.time}
                  </span>
                </div>
                <p className="body-copy mt-1">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}