
import React, { useState } from 'react'
import '../styles/CreateEvent.css'

const CreateEvent = props => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [capacity, setCapacity] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = e => {
    e.preventDefault()

    if (endTime <= startTime) {
      setMessage('End time must be after start time.')
      return
    }

    const id = crypto.randomUUID()

    const newEvent = {
      id: id,
      title: title,
      description: description,
      date: date,
      startTime: startTime,
      endTime: endTime,
      location: location,
      category: category,
      capacity: Number(capacity),
      attendeeIds: [],
      imageUrl: `https://picsum.photos/seed/${id}/800/400`
    }

    if (props.onCreate) {
      props.onCreate(newEvent)
    }

    setMessage('Event created successfully!')
  }

  return (
    <main className="create-event-page">
      <div className="doin-card create-event-card">
        <h1>Create an Event</h1>
        <p className="create-event-description">
          Bring people together by hosting an event.
        </p>

        <form className="create-event-form" onSubmit={handleSubmit}>
          <div className="create-event-field">
            <label htmlFor="event-title">Event Name</label>
            <input
              className="doin-input"
              id="event-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter event name"
              required
            />
          </div>

          <div className="create-event-field">
            <label htmlFor="event-description">Description</label>
            <textarea
              className="doin-input"
              id="event-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your event"
              required
            />
          </div>

          <div className="create-event-field">
            <label htmlFor="event-date">Date</label>
            <input
              className="doin-input"
              id="event-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="create-event-times">
            <div className="create-event-field">
              <label htmlFor="event-start">Start Time</label>
              <input
                className="doin-input"
                id="event-start"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="create-event-field">
              <label htmlFor="event-end">End Time</label>
              <input
                className="doin-input"
                id="event-end"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="create-event-field">
            <label htmlFor="event-location">Location</label>
            <input
              className="doin-input"
              id="event-location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Enter event location"
              required
            />
          </div>

          <div className="create-event-field">
            <label htmlFor="event-category">Category</label>
            <select
              className="doin-input"
              id="event-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              <option value="Sports">Sports</option>
              <option value="Music">Music</option>
              <option value="Gaming">Gaming</option>
              <option value="Food">Food</option>
              <option value="Social">Social</option>
            </select>
          </div>

          <div className="create-event-field">
            <label htmlFor="event-capacity">Maximum Attendees</label>
            <input
              className="doin-input"
              id="event-capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={e => setCapacity(e.target.value)}
              placeholder="Enter maximum attendees"
              required
            />
          </div>

          <button
            className="doin-button doin-button--primary create-event-submit"
            type="submit"
          >
            Publish Event
          </button>

          {message && <p role="status">{message}</p>}
        </form>
      </div>
    </main>
  )
}

export default CreateEvent
