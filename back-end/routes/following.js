import express from "express"
import posts from "../data/posts.js"
import following from "../data/following.js"

const router = express.Router()

router.get("/", (req, res) => {
  res.json({
    updates: following.updates,
    posts
  })
})

export default router