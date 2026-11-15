import express from 'express'
import fs from 'node:fs'
import path from 'node:path'

const app = express()
const mockDataPath = path.join(import.meta.dirname, 'mock', 'mockData.json')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// mock data for now, until the database is set up next sprint
app.get('/api/mockData', (req, res) => {
  const data = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'))
  res.json(data)
})

// profile starts from the mock data and is kept in memory until the database exists
let profile = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).profile

app.get('/api/profile', (req, res) => {
  res.json(profile)
})

app.post('/api/profile', (req, res) => {
  const { name, bio, picture } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' })
  }
  profile = { name: name.trim(), bio: (bio || '').trim(), picture: picture ?? profile.picture }
  res.json(profile)
})

// mock password kept in memory until real accounts are set up with the database
let password = 'password123'

app.post('/api/account/password', (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (currentPassword !== password) {
    return res.status(401).json({ error: 'Current password is incorrect.' })
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' })
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'New password must be different from your current one.' })
  }
  password = newPassword
  res.json({ message: 'Password updated' })
})

export default app

