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

// Rename a link or change whether it is active.
router.post('/:linkId', (req, res) => {
  const linkIndex = shareLinks.findIndex(
    link => link.id === req.params.linkId,
  )

  if (linkIndex === -1) {
    return res.status(404).json({ error: 'Share link not found.' })
  }

  const { sharedWith, active } = req.body || {}
  const hasSharedWith = typeof sharedWith !== 'undefined'
  const hasActive = typeof active !== 'undefined'

  if (!hasSharedWith && !hasActive) {
    return res.status(400).json({ error: 'Provide a name or active status to update.' })
  }

  if (hasSharedWith && (typeof sharedWith !== 'string' || !sharedWith.trim())) {
    return res.status(400).json({ error: 'The link name cannot be empty.' })
  }

  if (hasActive && typeof active !== 'boolean') {
    return res.status(400).json({ error: 'Active status must be true or false.' })
  }

  shareLinks[linkIndex] = {
    ...shareLinks[linkIndex],
    ...(hasSharedWith && { sharedWith: sharedWith.trim() }),
    ...(hasActive && { active }),
  }

  res.json(shareLinks[linkIndex])
})

export default router