import { useState, useEffect } from "react"
import "./MyHobbies.css"

function MyHobbies() {
  const [activeTab, setActiveTab] = useState("All")
  const [hobbyToLeave, setHobbyToLeave] = useState(null)
  const [eventToLeave, setEventToLeave] = useState(null)

  const [manageMenu, setManageMenu] = useState(null)
  const [eventToEdit, setEventToEdit] = useState(null)
  const [eventToDelete, setEventToDelete] = useState(null)

  const [joinedHobbies, setJoinedHobbies] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [hosting, setHosting] = useState([])

  useEffect(() => {
    fetch("/api/my-hobbies")
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to load My Hobbies")
        }
        return response.json()
      })
      .then(data => {
        setJoinedHobbies(data.joinedHobbies)
        setUpcomingEvents(data.upcomingEvents)
        setHosting(data.hosting)
      })
      .catch(error => console.error(error))
  }, [])

  const leaveHobby = async (id) => {
    try {
      const response = await fetch(`/api/my-hobbies/${id}/leave`, {
        method: "POST"
      })

      if (!response.ok) {
        throw new Error("Failed to leave hobby")
      }

      setJoinedHobbies(joinedHobbies.filter(hobby => hobby.id !== id))
      setHobbyToLeave(null)
    } catch (error) {
      console.error(error)
      alert("Could not leave hobby. Please try again.")
    }
  }

  const leaveEvent = async (id) => {
    try {
      const response = await fetch(`/api/my-events/${id}/leave`, {
        method: "POST"
      })

      if (!response.ok) {
        throw new Error("Failed to leave event")
      }

      setUpcomingEvents(upcomingEvents.filter(event => event.id !== id))
      setEventToLeave(null)
    } catch (error) {
      console.error(error)
      alert("Could not leave event. Please try again.")
    }
  }

  const deleteEvent = async (id) => {
    try {
      const response = await fetch(`/api/my-events/${id}/delete`, {
        method: "POST"
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      setHosting(hosting.filter(event => event.id !== id))
      setEventToDelete(null)
    } catch (error) {
      console.error(error)
      alert("Could not delete event. Please try again.")
    }
  }

  const saveEvent = async () => {
    if (!eventToEdit.title.trim() || !eventToEdit.date) {
      return
    }

    try {
      const response = await fetch(`/api/my-events/${eventToEdit.id}/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          title: eventToEdit.title,
          date: eventToEdit.date,
          day: new Date(eventToEdit.date).toLocaleDateString("en-US", {
            weekday: "short"
          }),

          time: new Date(eventToEdit.date).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          }).replace(", ", ", ").replace(/, (?=\d{1,2}:\d{2})/, " at "),
          
          location: eventToEdit.location
        })
      })

      if (!response.ok) {
        throw new Error("Failed to update event")
      }

      const updatedEvent = await response.json()

      setHosting(hosting.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      ))

      setEventToEdit(null)
    } catch (error) {
      console.error(error)
      alert("Could not update event. Please try again.")
    }
  }

  return (
    <main className="my-activities">
      <h1>My Hobbies</h1>
      <p>Manage your hobbies, events, and activities.</p>

      <div className="activities-counters">
        <div className="activities-counter">
          <h2>{joinedHobbies.length}</h2>
          <p>Joined Hobbies</p>
        </div>

        <div className="activities-counter">
          <h2>{upcomingEvents.length}</h2>
          <p>Upcoming Events</p>
        </div>

        <div className="activities-counter">
          <h2>{hosting.length}</h2>
          <p>Hosting</p>
        </div>
      </div>

      <div className="activities-tabs">
        {["All", "Joined", "Upcoming", "Hosting"].map(tab => (
          <button
            key={tab}
            className={
              activeTab === tab
                ? "activities-tab activities-tab-active"
                : "activities-tab"
            }
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {(activeTab === "All" || activeTab === "Joined") && (
        <section className="activities-section">
          <h2>Joined Hobbies</h2>

          {joinedHobbies.length === 0 ? (
            <p>You haven't joined any hobbies yet.</p>
          ) : (
            joinedHobbies.map(hobby => (
              <div className="activity-card" key={hobby.id}>
                <h3>{hobby.name}</h3>
                <p>{hobby.members} members</p>

                <button
                  className="activity-leave-button"
                  onClick={() => setHobbyToLeave(hobby)}
                >
                  Leave Hobby
                </button>
              </div>
            ))
          )}
        </section>
      )}

      {(activeTab === "All" || activeTab === "Upcoming") && (
        <section className="activities-section">
          <h2>Upcoming Events</h2>

          {upcomingEvents.length === 0 ? (
            <p>You have no upcoming events.</p>
          ) : (
            upcomingEvents.map(event => (
              <div className="activity-card" key={event.id}>
                <h3>{event.title}</h3>
                <p>{event.time}</p>
                <p>{event.location}</p>

                <button
                  className="activity-leave-button"
                  onClick={() => setEventToLeave(event)}
                >
                  Leave Event
                </button>
              </div>
            ))
          )}
        </section>
      )}

      {(activeTab === "All" || activeTab === "Hosting") && (
        <section className="activities-section">
          <h2>Hosting</h2>

          {hosting.length === 0 ? (
            <p>You aren't hosting any events yet.</p>
          ) : (
            hosting.map(event => (
              <div className="activity-card" key={event.id}>
                <h3>{event.title}</h3>
                <p>{event.time}</p>
                <p>{event.location}</p>
                <p>You are the host</p>

                <button
                  className="activity-leave-button"
                  onClick={() => setManageMenu(
                    manageMenu === event.id ? null : event.id
                  )}
                >
                  Manage Event
                </button>

                {manageMenu === event.id && (
                  <div className="activities-manage-menu">
                    <button
                      onClick={() => {
                        setEventToEdit({ ...event })
                        setManageMenu(null)
                      }}
                    >
                      Edit Event
                    </button>

                    <button
                      className="activities-delete-option"
                      onClick={() => {
                        setEventToDelete(event)
                        setManageMenu(null)
                      }}
                    >
                      Delete Event
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}

      {hobbyToLeave && (
        <div className="activities-overlay">
          <div className="activities-popup" role="dialog" aria-modal="true" aria-labelledby="leave-hobby-title">
            <h2 id="leave-hobby-title">Leave {hobbyToLeave.name}?</h2>
            <p>Are you sure you want to leave this hobby?</p>

            <div className="activities-popup-buttons">
              <button
                className="activities-cancel-button"
                onClick={() => setHobbyToLeave(null)}
              >
                Cancel
              </button>
              <button
                className="activities-confirm-button"
                onClick={() => leaveHobby(hobbyToLeave.id)}
              >
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {eventToLeave && (
        <div className="activities-overlay">
          <div className="activities-popup" role="dialog" aria-modal="true" aria-labelledby="leave-event-title">
            <h2 id="leave-event-title">Leave {eventToLeave.title}?</h2>
            <p>Are you sure you want to leave this event?</p>

            <div className="activities-popup-buttons">
              <button
                className="activities-cancel-button"
                onClick={() => setEventToLeave(null)}
              >
                Cancel
              </button>
              <button
                className="activities-confirm-button"
                onClick={() => leaveEvent(eventToLeave.id)}
              >
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {eventToEdit && (
        <div className="activities-overlay">
          <div className="activities-popup" role="dialog" aria-modal="true" aria-labelledby="edit-event-title">
            <h2 id="edit-event-title">Edit Event</h2>

            <form onSubmit={(e) => {
              e.preventDefault()
              saveEvent()
            }}>
              <label>Event Name</label>
              <input
                type="text"
                required
                value={eventToEdit.title}
                onChange={(e) => setEventToEdit({
                  ...eventToEdit,
                  title: e.target.value
                })}
              />

              <label>Date & Time</label>
              <input
                type="datetime-local"
                required
                value={eventToEdit.date || ""}
                onChange={(e) => setEventToEdit({
                  ...eventToEdit,
                  date: e.target.value
                })}
              />

              <label>Location</label>
              <input
                type="text"
                value={eventToEdit.location}
                onChange={(e) => setEventToEdit({
                  ...eventToEdit,
                  location: e.target.value
                })}
              />

              <div className="activities-popup-buttons">
                <button
                  type="button"
                  className="activities-cancel-button"
                  onClick={() => setEventToEdit(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="activities-confirm-button"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eventToDelete && (
        <div className="activities-overlay">
          <div className="activities-popup" role="dialog" aria-modal="true" aria-labelledby="delete-event-title">
            <h2 id="delete-event-title">Delete {eventToDelete.title}?</h2>
            <p>Are you sure you want to delete this event?</p>

            <div className="activities-popup-buttons">
              <button
                className="activities-cancel-button"
                onClick={() => setEventToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="activities-confirm-button"
                onClick={() => deleteEvent(eventToDelete.id)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default MyHobbies
