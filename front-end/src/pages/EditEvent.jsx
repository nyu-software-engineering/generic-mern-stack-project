import { useState } from "react";
import { mockEvent } from "../mocks/events";
import "./EditEvent.css";

// The categories an event can have. It is the same list the
// mock data and the Create Event page use.
const categories = ["Sports", "Music", "Gaming", "Food", "Social"];

// Edit Event page (#39): change the information of an event.
// The form starts with the values of the mock event, and saving
// writes the changes back into it, so the Event Details page
// shows the updated event.
export default function EditEvent() {
  // One state variable for each field, starting with the
  // current values of the mock event.
  const [title, setTitle] = useState(mockEvent.title);
  const [description, setDescription] = useState(mockEvent.description);
  const [date, setDate] = useState(mockEvent.date);
  const [startTime, setStartTime] = useState(mockEvent.startTime);
  const [endTime, setEndTime] = useState(mockEvent.endTime);
  const [location, setLocation] = useState(mockEvent.location);
  const [category, setCategory] = useState(mockEvent.category);
  const [capacity, setCapacity] = useState(mockEvent.capacity);
  const [saved, setSaved] = useState(false);

  // Runs when the user clicks Save.
  const handleSubmit = (e) => {
    e.preventDefault(); // stop the browser from reloading the page

    // Write the changes back into the shared mock event.
    mockEvent.title = title;
    mockEvent.description = description;
    mockEvent.date = date;
    mockEvent.startTime = startTime;
    mockEvent.endTime = endTime;
    mockEvent.location = location;
    mockEvent.category = category;
    mockEvent.capacity = Number(capacity);

    setSaved(true);
  };

  // Put every field back to the values of the mock event.
  const handleCancel = () => {
    setTitle(mockEvent.title);
    setDescription(mockEvent.description);
    setDate(mockEvent.date);
    setStartTime(mockEvent.startTime);
    setEndTime(mockEvent.endTime);
    setLocation(mockEvent.location);
    setCategory(mockEvent.category);
    setCapacity(mockEvent.capacity);
    setSaved(false);
  };

  return (
    <main className="edit-event-page">
      <div className="doin-card edit-event-card">
        <h1 className="edit-event-title">Edit event</h1>

        <form onSubmit={handleSubmit}>
          <div className="edit-event-field">
            <label htmlFor="title_field">Event Name</label>
            <input
              className="doin-input edit-event-input"
              id="title_field"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="edit-event-field">
            <label htmlFor="description_field">Description</label>
            <textarea
              className="doin-input edit-event-textarea"
              id="description_field"
              rows="4"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="edit-event-field">
            <label htmlFor="date_field">Date</label>
            <input
              className="doin-input edit-event-input"
              id="date_field"
              type="text"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="edit-event-field">
            <label htmlFor="start_field">Start Time</label>
            <input
              className="doin-input edit-event-input"
              id="start_field"
              type="text"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="edit-event-field">
            <label htmlFor="end_field">End Time</label>
            <input
              className="doin-input edit-event-input"
              id="end_field"
              type="text"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="edit-event-field">
            <label htmlFor="location_field">Location</label>
            <input
              className="doin-input edit-event-input"
              id="location_field"
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="edit-event-field">
            <label htmlFor="category_field">Category</label>
            <select
              className="doin-input edit-event-input"
              id="category_field"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSaved(false);
              }}
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="edit-event-field">
            <label htmlFor="capacity_field">Maximum Attendees</label>
            <input
              className="doin-input edit-event-input"
              id="capacity_field"
              type="number"
              value={capacity}
              onChange={(e) => {
                setCapacity(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          {saved && <p className="edit-event-saved">Saved!</p>}

          <div className="edit-event-actions">
            <button type="submit" className="doin-button doin-button--primary">
              Save
            </button>
            <button
              type="button"
              className="doin-button doin-button--secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
