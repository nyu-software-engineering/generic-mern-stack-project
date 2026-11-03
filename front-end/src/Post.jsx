import { useState } from "react";

function Post({ post }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="post">
      <p><strong>{post.username}</strong></p>
      <p>{post.time}</p>

      <img src={post.image} alt="post" />

      <p>{post.caption}</p>

      <button onClick={() => setLiked(!liked)}>
        {liked ? "Liked" : "Like"}
      </button>
    </div>
  );
}

export default Post;