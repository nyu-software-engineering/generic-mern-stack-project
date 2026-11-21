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

export default router
