import Post from "./Post";
import { posts } from "./mockData";

function Feed() {
  return (
    <div className="page">
      <h2>Feed</h2>

      <button>Create Post</button>

      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}

export default Feed;