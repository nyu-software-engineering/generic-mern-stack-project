import Post from "./Post";
import { posts } from "./mockData";
import "./Feed.css"
import { Link } from "react-router-dom"



function Feed() {
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