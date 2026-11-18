import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'

const app = express()
const mockDataPath = path.join(import.meta.dirname, 'mock', 'mockData.json')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('public/uploads'))

// mock data for now, until the database is set up next sprint
app.get('/api/mockData', (req, res) => {
  const data = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'))
  res.json(data)
})

// taken from express lecture notes
// enable file uploads saved to disk in a directory named 'public/uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads")
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    )
  },
})

const upload = multer({ storage: storage })

// new post testing
let posts = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).posts

app.get('/api/posts', (req, res) => {
  res.json(posts)
})

app.post('/api/posts', upload.single('image'), (req, res) => {
  const { id, username, pfp, category, title, desc, date, time, location, image, 
    includeBounty, bounty } = req.body
  if (!title || !title.trim() || !desc || !desc.trim()) {
    return res.status(400).json({ error: 'Title and description are required' })
  }
  if (includeBounty && (!bounty || !bounty.trim())) {
    return res.status(400).json({ error: 'If including bounty, bounty is required' })
  }
  const newPost = {
    id, username, pfp, category: category || 'lost', title: title.trim(), desc: desc.trim(), date, time, 
    location, image: req.file ? `/uploads/${req.file.filename}` : '', 
    includeBounty, bounty
  }
  posts.unshift(newPost)
  // successfully created new post
  res.status(201).json(newPost)
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