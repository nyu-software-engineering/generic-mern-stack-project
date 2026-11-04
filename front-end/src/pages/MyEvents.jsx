import React, { useState } from "react";
import "../styles/MyEvents.css";

const MyEvents = (props) => {
  const events = props.events || [];
  const currentUser = props.currentUser;

  const [activeTab, setActiveTab] = useState("joined");

  // Find events the current user has joined
  const joinedEvents = currentUser
    ? events.filter((event) =>
      (event.attendeeIds ?? []).includes(currentUser.id)
    )
  : [];

  // Find events the current user created
  const hostingEvents = currentUser
    ? events.filter((event) => event.organizerId === currentUser.id)
    : [];

  // Choose which events to display
  const displayedEvents = activeTab === "joined" ? joinedEvents : hostingEvents;

  return (
    <main className="my-events-page">
      <div className="my-events-container">
        <h1>My Events</h1>
        <p>View the events you're attending or hosting.</p>

        {/* Joined and Hosting Tabs */}
        <div className="my-events-tabs">
          <button
            className={`doin-button ${
              activeTab === "joined"
                ? "doin-button--primary"
                : "doin-button--secondary"
            }`}
            onClick={() => setActiveTab("joined")}
          >
            Joined ({joinedEvents.length})
          </button>

          <button
            className={`doin-button ${
              activeTab === "hosting"
                ? "doin-button--primary"
                : "doin-button--secondary"
            }`}
            onClick={() => setActiveTab("hosting")}
          >
            Hosting ({hostingEvents.length})
          </button>
        </div>

        {/* Event List */}
        <div className="my-events-list">
          {displayedEvents.length > 0 ? (
            displayedEvents.map((event) => (
              <div className="doin-card my-event-card" key={event.id}>
                <img
                  className="my-event-image"
                  src={event.imageUrl}
                  alt={event.title}
                />

                <div className="my-event-info">
                  <span className="my-event-category">{event.category}</span>

                  <h2>{event.title}</h2>

                  <p>
                    <strong>Date:</strong> {event.date}
                  </p>

                  <p>
                    <strong>Time:</strong> {event.startTime}
                  </p>

                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {activeTab === "joined" ? "Attending" : "Hosting"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="doin-card my-events-empty">
              <p>
                {activeTab === "joined"
                  ? "You haven't joined any events yet."
                  : "You haven't created any events yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MyEvents;
