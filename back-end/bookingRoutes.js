// Sprint 2 mock booking routes. Changes live in memory until the server restarts.
const express = require('express')
const initialBookings = require('./bookings.json')
const router = express.Router()
let bookings = initialBookings.map(booking => ({ ...booking }))
let nextId = Math.max(0, ...bookings.map(booking => Number(booking.id) || 0)) + 1
const editable = ['requested', 'confirmed']
const validStatuses = ['requested', 'confirmed', 'completed', 'cancelled', 'declined']

router.get('/', (req, res) => res.json(bookings))
router.get('/:id', (req, res) => {
  const booking = bookings.find(item => item.id === req.params.id)
  if (!booking) return res.status(404).json({ error: 'Booking not found.' })
  res.json(booking)
})
router.post('/', (req, res) => {
  const { serviceId, date, time, notes = '' } = req.body || {}
  if (!serviceId || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || '') || typeof notes !== 'string') {
    return res.status(400).json({ error: 'Valid serviceId, date (YYYY-MM-DD), time (HH:MM), and notes are required.' })
  }
  const booking = { id: String(nextId++), serviceId: String(serviceId), status: 'requested', date, time, notes }
  bookings.push(booking)
  res.status(201).json(booking)
})
router.patch('/:id', (req, res) => {
  const booking = bookings.find(item => item.id === req.params.id)
  if (!booking) return res.status(404).json({ error: 'Booking not found.' })
  const changes = req.body || {}
  const keys = Object.keys(changes)
  if (!keys.length || keys.some(key => !['date', 'time', 'notes', 'status'].includes(key))) {
    return res.status(400).json({ error: 'Unsupported booking update.' })
  }
  if (!editable.includes(booking.status)) return res.status(409).json({ error: 'This booking cannot be changed.' })
  if (changes.status !== undefined && !validStatuses.includes(changes.status)) return res.status(400).json({ error: 'Invalid status.' })
  if (changes.date !== undefined && (typeof changes.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(changes.date))) return res.status(400).json({ error: 'Invalid date.' })
  if (changes.time !== undefined && (typeof changes.time !== 'string' || !/^\d{2}:\d{2}$/.test(changes.time))) return res.status(400).json({ error: 'Invalid time.' })
  if (changes.notes !== undefined && typeof changes.notes !== 'string') return res.status(400).json({ error: 'Invalid notes.' })
  if ((changes.date !== undefined || changes.time !== undefined || changes.notes !== undefined) && changes.status && changes.status !== 'requested') return res.status(400).json({ error: 'Rescheduling must set status to requested.' })
  Object.assign(booking, changes)
  res.json(booking)
})
module.exports = router
