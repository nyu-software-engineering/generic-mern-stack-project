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

// resolved posts start from the mock data and new ones are added when a post is resolved
let resolvedPosts = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).resolvedPosts

app.get('/api/posts/resolved', (req, res) => {
  res.json(resolvedPosts)
})

app.post('/api/posts/resolved', (req, res) => {
  const { title, category, location, date } = req.body
  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required' })
  }
  const post = { title, category, location: location || '', date: date || '' }
  resolvedPosts.unshift(post)
  res.status(201).json(post)
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

export default app
