import { useState } from "react"
import { Link } from "react-router-dom"
import "./HobbyCard.css"

const HobbyCard = ({ hobby }) => {
  const [joined, setJoined] = useState(false)

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
        onClick={() => setJoined(!joined)}
      >
        {joined ? "Joined" : "Join"}
      </button>
    </article>
  )
}

export default HobbyCard