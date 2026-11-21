import Post from "./Post";
import { useEffect, useState } from "react"
import "./Feed.css"
import { Link } from "react-router-dom"



function Feed() {

  const [posts, setPosts] = useState([])

useEffect(() => {
  fetch("http://localhost:3000/api/posts")
    .then((response) => response.json())
    .then((data) => setPosts(data))
    .catch((error) => console.error("Error loading posts:", error))
}, [])

  return (
    <div className="feed-page">
      <input
        className="feed-search"
        type="text"
        placeholder="Search posts..."
      />

      <div className="feed-actions">
        <Link to="/create-post" className="feed-action-button">
          Create Post
        </Link>

        <Link to="/create-event" className="feed-action-button">
          Create Event
        </Link>
      </div>

      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}

export default Feed