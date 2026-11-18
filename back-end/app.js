import express from "express"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/static", express.static("public"))

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

export default app