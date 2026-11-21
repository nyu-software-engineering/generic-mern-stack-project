import express from 'express'
import fs from 'fs'

// load the apartment checks once, when the server starts
const apartmentChecks = JSON.parse(
  fs.readFileSync(new URL('../data/apartment-checks.json', import.meta.url)),
)

const router = express.Router()

// all checks, newest first
router.get('/', (req, res) => {
  const checks = [...apartmentChecks].sort((a, b) =>
    b.checkedOn.localeCompare(a.checkedOn),
  )
  res.json(checks)
})

// one check by its id
router.get('/:checkId', (req, res) => {
  const checkId = req.params.checkId
  const check = apartmentChecks.find(savedCheck => savedCheck.id === checkId)

  if (check) {
    res.json(check)
  } else {
    res.status(404).json({ error: 'Apartment check not found.' })
  }
})

export default router
