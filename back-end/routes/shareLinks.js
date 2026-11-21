import express from 'express'
import fs from 'fs'

let shareLinks = JSON.parse(
  fs.readFileSync(new URL('../data/share-links.json', import.meta.url)),
)

const router = express.Router()

// Return the saved links.
router.get('/', (req, res) => {
  res.json(shareLinks)
})

// Add a new link.
router.post('/', (req, res) => {
  const newLink = req.body

  if (!newLink?.id || !newLink?.url) {
    return res.status(400).json({ error: 'A link ID and URL are required.' })
  }

  shareLinks = [newLink, ...shareLinks]
  res.status(201).json(newLink)
})

export default router