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

// new post testing
let posts = []

app.get('/api/posts', (req, res) => {
  res.json(posts)
})

app.post('/api/posts', (req, res) => {
  const { id, username, pfp, category, title, desc, date, time, location, image, 
    includeBounty, bounty } = req.body
  if (!title || !title.trim() || !desc || !desc.trim()) {
    return res.status(400).json({ error: 'Title and description are required' })
  }
  if (includeBounty && (!bounty || !bounty.trim())) {
    return res.status(400).json({ error: 'If including bounty, bounty is required' })
  }
  const newPost = {
    id, username, pfp, category, title: title.trim(), desc: desc.trim(), date, time, 
    location, image, includeBounty, bounty
  }
  posts.unshift(newPost)
  // successfully created new post
  res.status(201).json(newPost)
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
