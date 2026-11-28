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

//So that data can persist between sessions
const updateMockData = (item, newData) => {
  const data = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'))
  data[item] = newData
  fs.writeFileSync(mockDataPath, JSON.stringify(data, null, 2));
}

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
export let posts = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).posts

// reset array to be used before each test to avoid post tests from affecting
// later tests in checking length of array
export const resetPosts = () => {
  posts = [
    {
      "id": 'test1',
      "email": "test1@gmail.com",
      "username": "Carol C.",
      "pfp": "https://picsum.photos/200?random=2",
      "category": "lost",
      "title": "Lost Book",
      "desc": "Please help!",
      "date": "2026-11-02",
      "time": "",
      "location": "Bobst Library",
      "includeBounty": false,
      "bounty": ""
    },
    {
      "id": '0',
      "email": "test0@gmail.com",
      "username": "Alice A.",
      "pfp": "https://picsum.photos/200?random=1",
      "category": "lost",
      "title": "Lost Wallet",
      "desc": "Has anyone seen my wallet?",
      "date": "",
      "time": "",
      "location": "Warren Weaver Hall, Rm. 109",
      "image": "",
      "includeBounty": false,
      "bounty": ""
    }
  ]
  updateMockData('posts', posts)
}

//Current session user
let currentUser = null

// lets the tests pretend a user is logged in
export const setCurrentUser = (user) => {
  currentUser = user
}

app.get('/api/user', (req, res) => {
  res.json(JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).profile)
})

app.get('/api/posts', (req, res) => {
  res.json(posts)
})

app.post('/api/posts', upload.single('image'), (req, res) => {
  const { id, email, username, pfp, category, title, desc, date, time, location, image, 
    includeBounty, bounty } = req.body
  if (!title || !title.trim() || !desc || !desc.trim()) {
    return res.status(400).json({ error: 'Title and description are required' })
  }
  if (includeBounty && (!bounty || !bounty.trim())) {
    return res.status(400).json({ error: 'If including bounty, bounty is required' })
  }
  const newPost = {
    id: crypto.randomUUID(), email, username, pfp, category: category || 'lost', title: title.trim(), desc: desc.trim(), date, time, 
    location, ...(req.file && { image: `/uploads/${req.file.filename}` }), 
    includeBounty, bounty
  }
  posts.unshift(newPost)
  // successfully created new post
  updateMockData('posts', posts)
  res.status(201).json(newPost)
})

app.post('/api/posts/edit', upload.single('image'), (req, res) => {
  const { id, email, username, pfp, category, title, desc, date, time, location, image, 
    includeBounty, bounty } = req.body
  if (!title || !title.trim() || !desc || !desc.trim()) {
    return res.status(400).json({ error: 'Title and description are required' })
  }
  if (includeBounty && (!bounty || !bounty.trim())) {
    return res.status(400).json({ error: 'If including bounty, bounty is required' })
  }
  const existing = posts.some(p => String(p.id) === String(id))
  if (!existing) {
    return res.status(400).json({ error: 'Trying to edit a non existing post' })
  }
  const targetPost = posts.find(p => String(p.id) === String(id))
  const editedPost = {
    id: targetPost.id, email, username, pfp, category: category || 'lost', title: title.trim(), desc: desc.trim(), date, time,
    location, image: req.file ? `/uploads/${req.file.filename}` : image,
    includeBounty, bounty
  }
  posts[posts.indexOf(targetPost)] = editedPost
  // console.log(posts)
  updateMockData("posts", posts)
  res.status(201).json(editedPost)
})

// used to resolve posts, i.e. delete from back-end... should also be used in the 
// delete for edit posts
app.delete('/api/posts/:id', (req, res) => {
  const id = req.params.id
  const index = posts.findIndex(post => post.id === id)

  if (index === -1) {
    return res.status(404).json({ error: 'Post id not found' })
  }

  posts.splice(index, 1)
  updateMockData("posts", posts)
  res.status(200).json({ message: 'success delete' })
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

// Default profile
let profile = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).profile

//use as a backup
app.get('/api/profile', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ error: 'You need to be logged in.' })
  }
  profile = currentUser.profile
  res.json(profile)
})
app.post('/api/profile/logout', upload.single('image'), (req, res) => {
  currentUser = null
  profile = null
  res.json(true)
})


app.post('/api/profile', upload.single('image'), (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ error: 'You need to be logged in.' })
  }
  const { name, bio, picture, email } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' })
  }
  const temp = currentUser
  profile = { name: name.trim(), bio: (bio || '').trim(),
    picture: req.file ? ((req.file && { image: `/uploads/${req.file.filename}` })).image : temp.profile.picture, 
    email: temp.email }
  temp.profile = profile
  users[currentUser] = temp 
  updateMockData("users", users)
  updateMockData('profile', temp.profile)
  posts = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).posts
  posts.forEach(post => {
    if (post.email === users[currentUser].email) {
      post.username = users[currentUser].profile.name
      post.pfp = users[currentUser].profile.picture
    }
  })
  updateMockData('posts', posts)
  return res.json(profile)
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

export const resetConversations = () => {
  conversations = [
    {
      "id": "0",
      "postId": 0,
      "email": "test0@gmail.com",
      "username": "Alice A.",
      "pfp": "https://picsum.photos/200?random=1",
      "item": "Lost Wallet",
      "location": "Warren Weaver Hall, Rm. 109",
      "includeBounty": false,
      "bounty": "",
      "read": true,
      "messages": [
        {
          "id": "1",
          "sender": "test0@gmail.com",
          "text": "Hey, did you find my wallet?",
          "time": "2:04 PM"
        }
      ],
      "owners": [
        "test0@gmail.com",
        "tester@gmail.com"
      ]
    },
    {
      "id": "2",
      "postId": 1,
      "email": "test2@gmail.com",
      "username": "Bob B.",
      "pfp": "https://picsum.photos/200?random=3",
      "item": "Lost Keys",
      "location": "Bobst Library",
      "includeBounty": false,
      "bounty": "",
      "read": false,
      "messages": [
        {
          "id": "2",
          "sender": "test2@gmail.com",
          "text": "I think I found your keys!",
          "time": "1:35 PM"
        }
      ],
      "owners": [
        "test2@gmail.com",
        "tester@gmail.com"
      ]
    }
  ]
  updateMockData("conversations", conversations)
}

app.get('/api/conversations', (req, res) => {
  console.log(currentUser)
  console.log(currentUser.email)
  const ownedConversations = conversations.filter(c => currentUser && (c.owners ?? []).includes(String(currentUser.email)))
  console.log(ownedConversations)
  res.json(ownedConversations)
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
  const { postId, email, username, pfp, item, location, includeBounty, bounty } = req.body
  if (postId === undefined || postId === null || postId === '') {
    return res.status(400).json({ error: 'Post id is required' })
  }
  const existing = conversations.find(c => String(c.postId) === String(postId) && (c.owners ?? []).includes(String(currentUser?.email)))  
  if (existing) {
    return res.json(existing)
  }
  const convo = {
    id: crypto.randomUUID(),
    postId,
    email: email ?? '',
    owners: [email, currentUser?.email],
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
  updateMockData("conversations", conversations)
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

app.post('/api/conversations/:id/messages', upload.single('image'), (req, res) => {
  const convo = conversations.find(c => String(c.id) === req.params.id)
  const index = conversations.findIndex(c => String(c.id) === req.params.id)
  if (!convo) {
    return res.status(404).json({ error: 'Conversation not found' })
  }
  const { text, sender, image } = req.body
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required' })
  }
  console.log("Sent")
  console.log(sender)
  const yours = convo.owners.indexOf(currentUser.email)
  const other = 1 - yours
  const message = {
    id: crypto.randomUUID(),
    sender: sender === currentUser.email ? currentUser.email : convo.owners[other],
    text: text.trim(),
    image: req.file ? ((req.file && { image: `/uploads/${req.file.filename}` })).image : null,
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  }
  // console.log(message)
  convo.messages.push(message)
  convo.read = message.sender === currentUser.email
  console.log(message.sender)
  
  if (message.sender !== currentUser.email) {
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
  console.log("AHHHHH")
  conversations[index] = convo
  updateMockData("conversations", conversations)
  console.log(convo)
  res.status(201).json(message)
})

// mock password kept in memory until real accounts are set up with the database
//let password = 'password123'

//User testing. Using salting and hasing methods learned in AIT
let users = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).users

const generateHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash
}

const checkPassword = async (password, hash) => {
  const passCheck = await bcrypt.compare(password, hash)
  return passCheck
}

app.post('/api/account/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentUser) {
    return res.status(401).json({ error: 'You need to be logged in to change your password.' })
  }
  // stored passwords are hashed, so compare with bcrypt instead of ===
  const correct = await checkPassword(currentPassword || '', currentUser.password)
  if (!correct) {
    return res.status(401).json({ error: 'Current password is incorrect.' })
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' })
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'New password must be different from your current one.' })
  }
  currentUser.password = await generateHash(newPassword)
  updateMockData('users', users)
  res.json({ message: 'Password updated' })
})

app.get('/api/profile/security/:email', (req, res) => {
  const existing = users.some(u => String(u.email) === req.params.email)
  if (!existing) {
    return res.status(401).json({ error: 'Account with email does not exists.' })
  }
  const user = users.find(u => String(u.email) === req.params.email)
  res.json(user.securityQuestion)
})


//To be assigned to a profile by default
const defaultProfile = {
    "name": "Username A",
    "bio": "Lorem ipsum dolor sit amet",
    "picture": "https://picsum.photos/200?random=0"
  }

app.post('/api/account/create', async (req, res) => {
  const {fullName, email, password, securityQuestion, securityAnswer} = req.body
  const existing = users.some(u => String(u.email) === email)
  if (existing) {
    return res.status(401).json({ error: 'Account with email already exists.' })
  }
  const hash = await generateHash(password)
  const hash2 = await generateHash(securityAnswer)
  const newUser = {
    "fullName": fullName,
    "email": email,
    "password": hash,
    "securityQuestion": securityQuestion,
    "securityAnswer": hash2,
    "profile": {
      ...defaultProfile, 
      'email': email
    }
  }
  users.push(newUser)
  updateMockData("users", users)
  currentUser = newUser
  profile = currentUser.profile
  updateMockData('profile', newUser.profile)
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
  currentUser = user
  profile = currentUser.profile
  profile['email'] = email
  updateMockData('profile', profile)
  console.log(currentUser)
  console.log("Logged in")
  res.json({ message: 'Logged in' })
})

app.post('/api/account/recovery', async (req, res) => {
  const {email, answer, password} = req.body
  const existing = users.some(u => String(u.email) === email)
  if (!existing) {
    return res.status(400).json({ error: 'Account with email address does not exist.' })
  }
  const user = users.find(u => String(u.email) === email)
  const checkPass = await checkPassword(answer, user["securityAnswer"])
  if(!checkPass){
    return res.status(401).json({ error: 'Password is incorrect' })
  }
  const hash = await generateHash(password)
  const modification = user
  modification["password"] = hash
  users[user] = modification
  updateMockData("users", users)
  res.json({ message: 'Logged in' })
})

app.post('/api/account/exists', (req, res) => {
  res.json({ message: 'Password updated' })
})

export default app
