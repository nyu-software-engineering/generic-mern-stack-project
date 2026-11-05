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

      <Link to="/discover" className="discover-button">
        Discover
      </Link>

      <Link to="/create-post" className="create-post">
        +
      </Link>

      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}

export default Feed