import { useState } from "react"
import "./MyHobbies.css"

function MyHobbies() {
  const [activeTab, setActiveTab] = useState("All")
  const [hobbyToLeave, setHobbyToLeave] = useState(null)
  const [eventToLeave, setEventToLeave] = useState(null)

  const [manageMenu, setManageMenu] = useState(null)
  const [eventToEdit, setEventToEdit] = useState(null)
  const [eventToDelete, setEventToDelete] = useState(null)

  const [joinedHobbies, setJoinedHobbies] = useState([
    { id: 1, name: "Painting Club", members: 12 },
    { id: 2, name: "Photography Group", members: 8 }
  ])

  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      name: "Weekend Art Workshop",
      date: "November 14",
      time: "2:00 PM",
      location: "Manhattan"
    },
    {
      id: 2,
      name: "Photography Walk",
      date: "November 20",
      time: "11:00 AM",
      location: "Brooklyn"
    }
  ])

  const [hosting, setHosting] = useState([
    {
      id: 1,
      name: "Beginner Yoga Meetup",
      date: "November 22",
      time: "10:00 AM",
      location: "Manhattan"
    }
  ])

  const leaveHobby = (id) => {
    setJoinedHobbies(joinedHobbies.filter(hobby => hobby.id !== id))
    setHobbyToLeave(null)
  }

  const leaveEvent = (id) => {
    setUpcomingEvents(upcomingEvents.filter(event => event.id !== id))
    setEventToLeave(null)
  }

  const deleteEvent = (id) => {
    setHosting(hosting.filter(event => event.id !== id))
    setEventToDelete(null)
  }

  const saveEvent = () => {
    if (!eventToEdit.name.trim() || !eventToEdit.date.trim()) {
      return
    }

    setHosting(hosting.map(event =>
      event.id === eventToEdit.id ? eventToEdit : event
    ))

    setEventToEdit(null)
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
                <h3>{event.name}</h3>
                <p>{event.date} at {event.time}</p>
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
                <h3>{event.name}</h3>
                <p>{event.date} at {event.time}</p>
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
            <h2 id="leave-event-title">Leave {eventToLeave.name}?</h2>
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
                value={eventToEdit.name}
                onChange={(e) => setEventToEdit({
                  ...eventToEdit,
                  name: e.target.value
                })}
              />

              <label>Date</label>
              <input
                type="text"
                required
                value={eventToEdit.date}
                onChange={(e) => setEventToEdit({
                  ...eventToEdit,
                  date: e.target.value
                })}
              />

              <label>Time</label>
              <input
                type="text"
                value={eventToEdit.time}
                onChange={(e) => setEventToEdit({
                  ...eventToEdit,
                  time: e.target.value
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
            <h2 id="delete-event-title">Delete {eventToDelete.name}?</h2>
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
