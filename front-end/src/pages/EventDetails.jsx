import React, { useState } from "react";
import "../styles/EventDetails.css";
import "../styles/EventRSVP.css";

const EventDetails = (props) => {
  const event = props.event;
  const users = props.users || [];
  const currentUser = props.currentUser;

  const [showAttendees, setShowAttendees] = useState(false);
  const [attendeeIds, setAttendeeIds] = useState(event?.attendeeIds || []);
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");

  if (!event) {
    return <p>Event not found.</p>;
  }

  // Get the users currently attending
  const attendees = users.filter((user) => attendeeIds.includes(user.id));

  // Check if the current user has joined
  const isAttending = currentUser
    ? attendeeIds.includes(currentUser.id)
    : false;

  const isFull = attendeeIds.length >= event.capacity;

  // Join the event
  const handleJoin = () => {
    if (!currentUser || isAttending || isFull) {
      return;
    }

    setAttendeeIds([...attendeeIds, currentUser.id]);
    setConfirmation("");
    setMessage("You have successfully joined this event!");
  };

  // Leave the event
  const handleLeave = () => {
    if (!currentUser || !isAttending) {
      return;
    }

    setAttendeeIds(attendeeIds.filter((id) => id !== currentUser.id));
    setConfirmation("");
    setMessage("You have left this event.");
  };

  return (
    <main className="event-details">
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

          {/* Event Description */}
          <div className="event-section">
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </div>

          {/* Event Information */}
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
                {attendeeIds.length} / {event.capacity} attending
              </p>

              <div className="attendee-progress">
                <div
                  className="attendee-progress-fill"
                  style={{
                    width: `${
                      event.capacity > 0
                        ? Math.min(
                            100,
                            (attendeeIds.length / event.capacity) * 100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="spots-remaining">
                {Math.max(0, event.capacity - attendeeIds.length)} spots
                remaining
              </p>
            </div>

            {/* Show/Hide Attendees */}
            <button
              className="doin-button doin-button--secondary attendee-toggle"
              onClick={() => setShowAttendees(!showAttendees)}
              aria-expanded={showAttendees}
              aria-controls="event-attendee-list"
            >
              {showAttendees ? "Hide Attendees" : "Show Attendees"}
            </button>

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

          {/* RSVP Button */}
          <div className="event-section rsvp-actions">
            {currentUser &&
              (isAttending ? (
                <button
                  className="doin-button doin-button--secondary"
                  onClick={() => {
                    setMessage("");
                    setConfirmation("leave");
                  }}
                >
                  Leave Event
                </button>
              ) : (
                <button
                  className="doin-button doin-button--primary"
                  disabled={isFull}
                  onClick={() => {
                    setMessage("");
                    setConfirmation("join");
                  }}
                >
                  {isFull ? "Event Full" : "Join Event"}
                </button>
              ))}
          </div>

          {/* RSVP Confirmation */}
          {confirmation === "join" && (
            <div className="event-section rsvp-confirmation">
              <h2>Confirm RSVP</h2>

              <p>Are you sure you want to join {event.title}?</p>
              <p>Date: {event.date}</p>
              <p>Location: {event.location}</p>
              <p>
                {Math.max(0, event.capacity - attendeeIds.length)} spots
                available
              </p>

              <button
                className="doin-button doin-button--primary"
                onClick={handleJoin}
              >
                Confirm RSVP
              </button>

              <button
                className="doin-button doin-button--secondary"
                onClick={() => setConfirmation("")}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Leave Confirmation */}
          {confirmation === "leave" && (
            <div className="event-section rsvp-confirmation">
              <h2>Leave Event?</h2>

              <p>
                Your RSVP will be removed and your spot will become available.
              </p>

              <button
                className="doin-button doin-button--primary"
                onClick={handleLeave}
              >
                Confirm Leave
              </button>

              <button
                className="doin-button doin-button--secondary"
                onClick={() => setConfirmation("")}
              >
                Keep RSVP
              </button>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <p className="rsvp-message" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default EventDetails;
