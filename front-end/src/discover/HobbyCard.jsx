import { useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./HobbyCard.css"

const HobbyCard = ({ hobby }) => {
  const [joined, setJoined] = useState(false)

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

  return (
    <article className="hobby-card">
      <Link className="hobby-card-link" to={`/hobbies/${hobby.id}`}>
        <img
          className="hobby-card-photo"
          src={`https://picsum.photos/seed/hobby${hobby.id}/400/260`}
          alt={hobby.name}
        />
        <p className="hobby-card-name">{hobby.name}</p>
        <p className="hobby-card-members">{hobby.members} members</p>
      </Link>
      <button
        className={joined ? "hobby-card-button-joined" : "hobby-card-button"}
        onClick={handleJoin}
      >
        {joined ? "Joined" : "Join"}
      </button>
    </article>
  )
}

export default HobbyCard