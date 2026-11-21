import express from 'express'
import fs from 'fs'

// load the rent trends once, when the server starts
const rentTrends = JSON.parse(
  fs.readFileSync(new URL('../data/rent-trends.json', import.meta.url))
)

const router = express.Router()

router.get('/:areaId', (req, res) => {
  const trend = rentTrends.find(item => item.areaId === req.params.areaId)
  if (!trend) {
    return res.status(404).json({ error: 'No rent trend for this area' })
  }
  res.json(trend)
})

export default router
