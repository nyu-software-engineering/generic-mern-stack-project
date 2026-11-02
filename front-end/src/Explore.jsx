
import "./Explore.css";
import mockEvents from "./mockEvents";

function Explore({ onViewEvent, onCreateEvent }) {
  return (
    <div className="explore">
      <h1>Discover events</h1>
      <hr />

      <label>Search events</label>
      <input type="text" />

      <div className="event-filters">
        Date • Category • Location
      </div>

      {mockEvents.map((event) => (
        <div className="event-card" key={event.id}>
          <img src={event.image} alt={event.title} />

          <div className="event-info">
            <h3>{event.title}</h3>
            <p>
              {event.date} {event.time} • {event.location}
            </p>

            <button onClick={() => onViewEvent(event)}>
              View event
            </button>
          </div>
        </div>
      ))}

      <button
        className="create-event"
        onClick={onCreateEvent}
      >
        + Create
      </button>

      <div className="event-navigation">
        <p>People　 Events　 Connect　 Profile</p>
      </div>
    </div>
  );
}

export default Explore;
