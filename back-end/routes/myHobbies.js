import express from "express"
import hobbies from "../data/hobbies.js"
import events from "../data/events.js"

const router = express.Router()

let joinedHobbyIds = [1, 2]
let joinedEventIds = [1, 4]
let hostedEventIds = [3]
let editedEvents = {}

// Reset mock data between tests
export function resetMyHobbiesData() {
  joinedHobbyIds = [1, 2]
  joinedEventIds = [1, 4]
  hostedEventIds = [3]
  editedEvents = {}
}

// Get the user's joined hobbies and events
router.get("/my-hobbies", (req, res) => {
  const joinedHobbies = hobbies.filter(hobby =>
    joinedHobbyIds.includes(hobby.id)
  )

  const upcomingEvents = events.filter(event =>
    joinedEventIds.includes(event.id)
  )
  
  const hosting = events
    .filter(event => hostedEventIds.includes(event.id))
    .map(event => editedEvents[event.id] || event)

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


 // Edit a hosted event
router.post("/my-events/:id/edit", (req, res) => {
  const id = Number(req.params.id)

  if (!hostedEventIds.includes(id)) {
    return res.status(404).json({ error: "Hosted event not found" })
  }

  const event = editedEvents[id] || events.find(item => item.id === id)

  editedEvents[id] = {
    ...event,
    ...req.body,
    id
  }

  res.json(editedEvents[id])
})


// Delete a hosted event
router.post("/my-events/:id/delete", (req, res) => {
  const id = Number(req.params.id)

  if (!hostedEventIds.includes(id)) {
    return res.status(404).json({ error: "Hosted event not found" })
  }

  hostedEventIds.splice(hostedEventIds.indexOf(id), 1)
  delete editedEvents[id]

  res.json({ eventId: id, deleted: true })
})


export default router
