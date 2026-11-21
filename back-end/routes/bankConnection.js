import express from 'express'
import fs from 'fs'

// Load the starting connection state.
let bankConnection = JSON.parse(
  fs.readFileSync(new URL('../data/bank-connection.json', import.meta.url)),
)

const router = express.Router()

// Return whether the bank is connected.
router.get('/', (req, res) => {
  res.json(bankConnection)
})

// Simulate connecting to Chase.
router.post('/', (req, res) => {
  bankConnection = { connected: true, bankName: 'Chase' }
  res.json({ connected: true })
})

export default router
