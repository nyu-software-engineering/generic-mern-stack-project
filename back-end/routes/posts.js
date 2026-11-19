import express from "express"
import posts from "../data/posts.js"

const router = express.Router()

router.get("/", (req, res) => {
  res.json(posts)
})

router.post("/", (req, res) => {
  const { username, caption, image } = req.body

  const newPost = {
    id: Date.now(),
    username,
    caption,
    image,
    time: "Just now",
    liked: false
  }

  res.status(201).json(newPost)
})

export default router