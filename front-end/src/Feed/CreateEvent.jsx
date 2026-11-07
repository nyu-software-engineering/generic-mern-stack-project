import { useState } from "react"
import "./CreateEvent.css"

function CreateEvent() {
  const [location, setLocation] = useState("")
  const [time, setTime] = useState("")
  const [capacity, setCapacity] = useState("")
  const [caption, setCaption] = useState("")

  return (
    <div className="create-event-page">
      <h2>Create Event</h2>

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <input
        type="text"
        placeholder="Time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <input
        type="number"
        placeholder="Capacity"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
      />

      <textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <button className="event-post-button">
        Create Event
      </button>
    </div>
  )
}

export default CreateEvent