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
    axios(`/api/hobbies/${id}`).then(response => setHobby(response.data))
    axios(`/api/hobbies/${id}/events`).then(response => setEvents(response.data))
  }, [id])

  const handleJoin = () => {
    if (joined) {
      setJoined(false)
      return
    }
    axios
      .post(`/api/hobbies/${hobby.id}/join`)
      .then(response => setJoined(response.data.joined))
      .catch(error => console.error(error))
  }

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
        onClick={handleJoin}
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