import express from 'express'
import fs from 'fs'

// load the apartment checks and saved outcomes once, when the server starts
const apartmentChecks = JSON.parse(
  fs.readFileSync(new URL('../data/apartment-checks.json', import.meta.url))
)
const outcomes = JSON.parse(
  fs.readFileSync(new URL('../data/outcomes.json', import.meta.url))
)

// the same choices as the Record outcome screen
const OUTCOME_VALUES = [
  'rent-lowered',
  'increase-reduced',
  'accepted-as-proposed',
  'application-accepted',
  'application-rejected',
  'no-response',
]

const router = express.Router()

// the saved outcome for one apartment check, or null if there isn't one
router.get('/:checkId', (req, res) => {
  const checkId = req.params.checkId
  if (!apartmentChecks.some(check => check.id === checkId)) {
    return res.status(404).json({ error: 'Apartment check not found.' })
  }
  res.json(outcomes[checkId] ?? null)
})

// receive an outcome from the Record outcome form
router.post('/:checkId', (req, res) => {
  const checkId = req.params.checkId
  const { outcome, finalRent, note } = req.body

  if (!apartmentChecks.some(check => check.id === checkId)) {
    return res.status(404).json({ error: 'Apartment check not found.' })
  }
  if (!OUTCOME_VALUES.includes(outcome)) {
    return res.status(400).json({ error: 'Please choose an outcome.' })
  }

  // not saved anywhere yet; the database comes in Sprint 3
  res.json({
    outcome,
    finalRent: finalRent ?? null,
    note: note ?? '',
    updatedAt: new Date().toISOString(),
  })
})

export default router
