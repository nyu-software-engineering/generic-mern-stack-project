import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import bcrypt from "bcrypt"

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
// creates functions storage.getDestination and storage.getFilename
export const storage = multer.diskStorage({
  // saves uploaded files into directory public/uploads
  destination: function (req, file, cb) {
    cb(null, "public/uploads")
  },
  // creates filename based on current time
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
    location, ...(req.file && { image: `/uploads/${req.file.filename}` }), 
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

let notifications = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).notifications

app.get('/api/notifications', (req, res) => {
  res.json(notifications)
})

app.patch('/api/notifications/read-all', (req, res) => {
  notifications.forEach(n => { n.read = true })
  res.json(notifications)
})

app.patch('/api/notifications/:id/read', (req, res) => {
  const notification = notifications.find(n => String(n.id) === req.params.id)
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' })
  }
  notification.read = true
  res.json(notification)
})

let conversations = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).conversations

app.get('/api/conversations', (req, res) => {
  res.json(conversations)
})

app.get('/api/conversations/:id', (req, res) => {
  const convo = conversations.find(c => String(c.id) === req.params.id)
  if (!convo) {
    return res.status(404).json({ error: 'Conversation not found' })
  }
  res.json(convo)
})

// starts a chat about a post or returns the chat that already exists for that post
app.post('/api/conversations', (req, res) => {
  const { postId, username, pfp, item, location, includeBounty, bounty } = req.body
  if (postId === undefined || postId === null || postId === '') {
    return res.status(400).json({ error: 'Post id is required' })
  }
  const existing = conversations.find(c => String(c.postId) === String(postId))
  if (existing) {
    return res.json(existing)
  }
  const convo = {
    id: crypto.randomUUID(),
    postId,
    username: username ?? 'Unknown',
    pfp: pfp ?? '',
    item: item ?? '',
    location: location ?? '',
    includeBounty: includeBounty ?? false,
    bounty: bounty ?? '',
    read: true,
    messages: []
  }
  conversations.unshift(convo)
  res.status(201).json(convo)
})

app.patch('/api/conversations/:id/read', (req, res) => {
  const convo = conversations.find(c => String(c.id) === req.params.id)
  if (!convo) {
    return res.status(404).json({ error: 'Conversation not found' })
  }
  convo.read = true
  res.json(convo)
})

app.post('/api/conversations/:id/messages', (req, res) => {
  const convo = conversations.find(c => String(c.id) === req.params.id)
  if (!convo) {
    return res.status(404).json({ error: 'Conversation not found' })
  }
  const { text, sender } = req.body
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required' })
  }
  const message = {
    id: crypto.randomUUID(),
    sender: sender === 'other' ? 'other' : 'you',
    text: text.trim(),
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  }
  convo.messages.push(message)
  convo.read = message.sender === 'you'
  
  if (message.sender === 'other') {
    notifications.unshift({
      id: crypto.randomUUID(),
      title: `New message • ${convo.username}`,
      description: `About ${convo.item}: ${message.text}`,
      time: `Today · ${message.time}`,
      createdAt: message.createdAt,
      read: false,
      link: 'Open Conversation',
      path: `/messages/${convo.id}`,
      pfp: convo.pfp
    })
  }

  res.status(201).json(message)
})

// mock password kept in memory until real accounts are set up with the database
//let password = 'password123'

//User testing. Using salting and hasing methods learned in AIT
let users = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).users
let currentUser = ""

const generateHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
}

const checkPassword = async (password, hash) => {
  const passCheck = await bcrypt.compare(password, hash)
  return passCheck
}

app.post('/api/account/password', (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = users.find(u => String(u.email) === currentUser)
  const password = user["password"]
  if (currentPassword !== password) {
    return res.status(401).json({ error: 'Current password is incorrect.' })
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' })
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'New password must be different from your current one.' })
  }
  const hash = generateHash(newPassword)
  const modification = user
  modification["password"] = hash
  users[user] = modification
  res.json({ message: 'Password updated' })
})

app.post('/api/account/create', async (req, res) => {
  const {fullName, email, password} = req.body
  const existing = users.some(u => String(u.email) === email)
  if (existing) {
    return res.status(401).json({ error: 'Account with email already exists.' })
  }
  const hash = await generateHash(password)
  const newUser = {
    "fullName": fullName,
    "email": "email",
    "password": hash
  }
  users.push(newUser)
  res.json({ message: 'Account created' })
})

app.post('/api/account/login', async (req, res) => {
  const {email, password} = req.body
  const existing = users.some(u => String(u.email) === email)
  if (!existing) {
    return res.status(400).json({ error: 'Account with email address does not exist.' })
  }
  const user = users.find(u => String(u.email) === email)
  const checkPass = await checkPassword(password, user["password"])
  if(!checkPass){
    return res.status(401).json({ error: 'Password is incorrect' })
  }
  res.json({ message: 'Logged in' })
})

app.post('/api/account/exists', (req, res) => {
  res.json({ message: 'Password updated' })
})

export default app
