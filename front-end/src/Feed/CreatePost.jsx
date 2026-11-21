import { useState } from "react"
import "./CreatePost.css"

function CreatePost() {
  const [caption, setCaption] = useState("")
  const [selectedImage, setSelectedImage] = useState("")

  const handlePost = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "myapyke",
          caption: caption,
          image: selectedImage
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create post")
      }

      const data = await response.json()
      console.log("Post created:", data)

      setCaption("")
      setSelectedImage("")
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  return (
    <div className="create-post-page">
      <h2>Create Post</h2>

      <div className="photo-options">
        <button onClick={() => setSelectedImage("https://picsum.photos/500/300")}>
          Add Photo
        </button>

        <button>
          Take Photo
        </button>
      </div>

      <textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <button
        className="post-button"
        onClick={handlePost}
      >
        Post
      </button>
    </div>
  )
}

export default CreatePost