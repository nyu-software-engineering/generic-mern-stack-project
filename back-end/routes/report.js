import express from 'express'
import fs from 'fs'

const report = JSON.parse(
  fs.readFileSync(new URL('../data/report.json', import.meta.url)),
)

const router = express.Router()

// Return the demo report.
router.get('/', (req, res) => {
  res.json(report)
})

// Return the sections the renter chose.
router.post('/sections', (req, res) => {
  const { sections } = req.body

  if (!Array.isArray(sections)) {
    return res.status(400).json({ error: 'Please provide the selected sections.' })
  }

  res.json({ sections })
})

export default router