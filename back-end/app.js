import express from "express"
import cors from "cors"
import discoverRoutes from "./routes/discover.js"
import profileRoutes from "./routes/profile.js"
import postsRouter from "./routes/posts.js"
import followingRouter from "./routes/following.js"
import chatRoutes from "./routes/chat.js"

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api", discoverRoutes)
app.use("/api", profileRoutes)
app.use(express.urlencoded({ extended: true }))
app.use("/static", express.static("public"))
app.use("/api/posts", postsRouter)
app.use("/api/following", followingRouter)
app.use("/api", chatRoutes)

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

export default app