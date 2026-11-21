import express from "express"
import hobbies from "../data/hobbies.js"
import events from "../data/events.js"

const router = express.Router()

// Mock hobbies and events for the current user
const joinedHobbyIds = [1, 2]
const joinedEventIds = [1, 4]
const hostedEventIds = [3]

// Get the user's joined hobbies and events
router.get("/my-hobbies", (req, res) => {
  const joinedHobbies = hobbies.filter(hobby =>
    joinedHobbyIds.includes(hobby.id)
  )

  const upcomingEvents = events.filter(event =>
    joinedEventIds.includes(event.id)
  )

  const hosting = events.filter(event =>
    hostedEventIds.includes(event.id)
  )

  res.json({
    joinedHobbies,
    upcomingEvents,
    hosting
  })
})


 // Leave a hobby
router.post("/my-hobbies/:id/leave", (req, res) => {
  const id = Number(req.params.id)

  if (!joinedHobbyIds.includes(id)) {
    return res.status(404).json({ error: "Joined hobby not found" })
  }

  joinedHobbyIds.splice(joinedHobbyIds.indexOf(id), 1)

  res.json({ hobbyId: id, left: true })
})

// Leave an event
router.post("/my-events/:id/leave", (req, res) => {
  const id = Number(req.params.id)

  if (!joinedEventIds.includes(id)) {
    return res.status(404).json({ error: "Joined event not found" })
  }

  joinedEventIds.splice(joinedEventIds.indexOf(id), 1)

  res.json({ eventId: id, left: true })
})

export default router
