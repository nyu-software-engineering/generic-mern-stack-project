import React, { useState } from "react";
import "../styles/EventDetails.css";

const EventDetails = (props) => {
  const event = props.event;
  const users = props.users || [];

  const [showAttendees, setShowAttendees] = useState(false);

  if (!event) {
    return <p>Event not found.</p>;
  }

  const attendees = users.filter((user) =>
    (event.attendeeIds || []).includes(user.id),
  );

  return (
    <div className="event-details">
      <div className="doin-card event-details-card">
        <img
          className="event-details-image"
          src={event.imageUrl}
          alt={event.title}
        />

        <div className="event-details-content">
          <span className="event-category">{event.category}</span>

          <h1>{event.title}</h1>

          <p className="event-organizer">Organized by {event.organizer}</p>

          <div className="event-section">
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </div>

          <div className="event-section">
            <h2>Event Information</h2>

            <div className="event-info">
              <p>
                <strong>Date:</strong> {event.date}
              </p>
              <p>
                <strong>Start Time:</strong> {event.startTime}
              </p>
              <p>
                <strong>End Time:</strong> {event.endTime}
              </p>
              <p>
                <strong>Location:</strong> {event.location}
              </p>
            </div>
          </div>

          {/* Attendee Section */}
          <div className="event-section">
            <h2>Who's Going?</h2>

            <div className="attendee-summary">
              <p className="attendee-count">
                {attendees.length} / {event.capacity} attending
              </p>

              <div className="attendee-progress">
                <div
                  className="attendee-progress-fill"
                  style={{
                    width: `${
                      event.capacity > 0
                        ? Math.min(
                            100,
                            (attendees.length / event.capacity) * 100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="spots-remaining">
                {Math.max(0, event.capacity - attendees.length)} spots remaining
              </p>
            </div>

            {/* Show/Hide Button */}
            <button
              className="doin-button doin-button--secondary attendee-toggle"
              onClick={() => setShowAttendees(!showAttendees)}
              aria-expanded={showAttendees}
              aria-controls="event-attendee-list"
            >
              {showAttendees ? "Hide Attendees" : "Show Attendees"}
            </button>

            {/* Only show attendees when button is clicked */}
            {showAttendees && (
              <div className="attendee-list" id="event-attendee-list">
                {attendees.map((user) => (
                  <div className="attendee" key={user.id}>
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="attendee-image"
                    />

                    <span>{user.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
