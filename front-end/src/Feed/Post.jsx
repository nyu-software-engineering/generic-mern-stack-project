import { useState } from "react"

function Post({ post }) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="post">
      <div className="post-user">
        <div>
          <strong>{post.username}</strong>
          <p>{post.time}</p>
        </div>
      </div>

      <img
        className="post-image"
        src={post.image}
        alt="post"
      />

      <p className="post-caption">{post.caption}</p>

      <div className="post-actions">
        <button onClick={() => setLiked(!liked)}>
          {liked ? "Liked" : "Like"}
        </button>
      </div>
    </div>
  )
}

export default Post