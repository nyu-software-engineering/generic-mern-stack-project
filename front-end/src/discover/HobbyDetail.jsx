import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import axios from "axios"
import "./HobbyDetail.css"

const HobbyDetail = () => {
  const { id } = useParams()
  const [hobby, setHobby] = useState(null)
  const [events, setEvents] = useState([])
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    axios("/mock/hobbies.json").then(response => {
      setHobby(response.data.find(item => item.id === Number(id)))
    })
    axios("/mock/events.json").then(response => {
      setEvents(response.data.filter(item => item.hobbyId === Number(id)))
    })
  }, [id])

  if (!hobby) {
    return <p>Loading...</p>
  }

  return (
    <main className="hobby-detail">
      <Link className="hobby-detail-back" to="/discover">
        ← Back
      </Link>
      <img
        className="hobby-detail-photo"
        src={`https://picsum.photos/seed/hobby${hobby.id}/800/400`}
        alt={hobby.name}
      />
      <h1 className="hobby-detail-name">{hobby.name}</h1>
      <p className="hobby-detail-info">
        {hobby.members} members · {events.length} events this week
      </p>
      <p>{hobby.description}</p>
      <button
        className={joined ? "hobby-detail-joined" : "hobby-detail-join"}
        onClick={() => setJoined(!joined)}
      >
        {joined ? "Joined" : "Join hobby"}
      </button>

      <h2 className="hobby-detail-heading">Upcoming Events</h2>
      {events.map(event => (
        <Link
          key={event.id}
          className="hobby-detail-event"
          to={`/events/${event.id}`}
        >
          {event.day} · {event.location} · {event.going} going
        </Link>
      ))}
    </main>
  )
}

export default HobbyDetail