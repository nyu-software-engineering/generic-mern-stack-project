import { useEffect, useState } from "react"
import { Link, useParams, useLocation } from "react-router-dom"
import axios from "axios"
import "./EventDetail.css"

const EventDetail = () => {
  const { id } = useParams()
  const location = useLocation()
  const [event, setEvent] = useState(null)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    axios("/mock/events.json").then(response => {
      setEvent(response.data.find(item => item.id === Number(id)))
    })
  }, [id])

  if (!event) {
    return <p>Loading...</p>
  }

  return (
    <main className="event-detail">
      <Link
        className="event-detail-back"
        to={location.state?.from || `/hobbies/${event.hobbyId}`}
      >
        ← Back
      </Link>
      <img
        className="event-detail-photo"
        src={`https://picsum.photos/seed/event${event.id}/800/400`}
        alt={event.title}
      />
      <h1 className="event-detail-title">{event.title}</h1>
      <p className="event-detail-info">
        {event.hobby} · Hosted by {event.host}
      </p>
      <ul>
        <li>{event.time}</li>
        <li>{event.location}</li>
        <li>
          {event.going}/{event.capacity} joined
        </li>
      </ul>
      <p>{event.description}</p>

      <h2 className="event-detail-heading">Who's going</h2>
      <div className="event-detail-people">
        {[1, 2, 3, 4, 5].map(number => (
          <img
            key={number}
            className="event-detail-person"
            src={`https://picsum.photos/seed/person${number}/80/80`}
            alt="Person going"
          />
        ))}
        {event.going > 5 && <span>+ {event.going - 5}</span>}
      </div>

      <button
        className={joined ? "event-detail-joined" : "event-detail-join"}
        onClick={() => setJoined(!joined)}
      >
        {joined ? "Joined" : "Join event"}
      </button>
    </main>
  )
}

export default EventDetail