import express from "express"
import hobbies from "../data/hobbies.js"
import events from "../data/events.js"

const router = express.Router()

// all hobbies (Discover page)
router.get("/hobbies", (req, res) => {
  res.json(hobbies)
})

// one hobby (HobbyDetail page)
router.get("/hobbies/:id", (req, res) => {
  const hobby = hobbies.find(item => item.id === Number(req.params.id))
  if (!hobby) {
    return res.status(404).json({ error: "Hobby not found" })
  }
  res.json(hobby)
})

// events for one hobby (HobbyDetail page)
router.get("/hobbies/:id/events", (req, res) => {
  const hobbyEvents = events.filter(item => item.hobbyId === Number(req.params.id))
  res.json(hobbyEvents)
})

// one event (EventDetail page)
router.get("/events/:id", (req, res) => {
  const event = events.find(item => item.id === Number(req.params.id))
  if (!event) {
    return res.status(404).json({ error: "Event not found" })
  }
  res.json(event)
})

// join a hobby (Join buttons) - not saved anywhere until we add a database
router.post("/hobbies/:id/join", (req, res) => {
  const hobby = hobbies.find(item => item.id === Number(req.params.id))
  if (!hobby) {
    return res.status(404).json({ error: "Hobby not found" })
  }
  res.json({ hobbyId: hobby.id, joined: true })
})

// join an event (Join button) - not saved anywhere until we add a database
router.post("/events/:id/join", (req, res) => {
  const event = events.find(item => item.id === Number(req.params.id))
  if (!event) {
    return res.status(404).json({ error: "Event not found" })
  }
  res.json({ eventId: event.id, joined: true })
})

export default router