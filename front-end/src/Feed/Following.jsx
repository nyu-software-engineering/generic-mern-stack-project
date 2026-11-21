import { useEffect, useState } from "react"
import Post from "./Post"
import "./Feed.css"

function Following() {
  const [posts, setPosts] = useState([])
  const [updates, setUpdates] = useState([])

  useEffect(() => {
    fetch("http://localhost:3000/api/following")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts)
        setUpdates(data.updates)
      })
      .catch((error) => console.error("Error loading following:", error))
  }, [])

  return (
    <div className="feed-page">
      <input
        className="feed-search"
        type="text"
        placeholder="Search following..."
      />

      <div className="updates-banner">
        {updates.map((update) => (
          <div className="update-card" key={update.id}>
            <strong>{update.username}</strong>
            <span>{update.message}</span>
          </div>
        ))}
      </div>

      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}

export default Following