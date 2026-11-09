import Post from "./Post"
import { posts } from "./mockData"
import "./Feed.css"

function Following() {
  return (
    <div className="feed-page">
      <input
        className="feed-search"
        type="text"
        placeholder="Search following..."
      />

      <div className="updates-banner">
        <div className="update-card">
          <strong>Myapyke</strong>
          <span>New pottery class posted</span>
        </div>

        <div className="update-card">
          <strong>Alyshoe</strong>
          <span>Added a new Pilates event</span>
        </div>

        <div className="update-card">
          <strong>JordanLee</strong>
          <span>Climbing meetup tonight</span>
        </div>
      </div>

      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}

export default Following