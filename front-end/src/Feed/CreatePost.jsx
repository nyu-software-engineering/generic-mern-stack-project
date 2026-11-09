import { useState } from "react"
import "./CreatePost.css"

function CreatePost() {
  const [caption, setCaption] = useState("")

  return (
    <div className="create-post-page">
      <h2>Create Post</h2>

      <div className="photo-options">
        <button>Add Photo</button>
        <button>Take Photo</button>
      </div>

      <textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <button className="post-button">
        Post
      </button>
    </div>
  )
}

export default CreatePost