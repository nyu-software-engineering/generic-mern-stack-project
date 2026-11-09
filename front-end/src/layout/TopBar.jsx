import { Link } from "react-router-dom"

const TopBar = () => {
  return (
    <header className="top-bar">
      <Link to="/feed" className="top-bar-brand">
        HobbyHub
      </Link>
      <Link to="/chat" className="top-bar-chat">
        Chat
      </Link>
    </header>
  )
}

export default TopBar