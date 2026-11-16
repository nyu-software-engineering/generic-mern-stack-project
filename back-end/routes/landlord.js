import express from 'express'
import fs from 'fs'

//load the received reports once, when the server starts
const receivedReports = JSON.parse(
  fs.readFileSync(new URL('../data/received-reports.json', import.meta.url)),
)

const router = express.Router()

//newest reports first
router.get('/reports', (req, res) => {
  const reports = [...receivedReports].sort((a, b) =>
    b.sharedOn.localeCompare(a.sharedOn),
  )
  res.json(reports)
})

export default router