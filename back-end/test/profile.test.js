import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'
import { setCurrentUser, resetPosts } from '../app.js'

describe('GET /api/profile', () => {
  it('responds with the profile', async () => {
    const res = await request(app).get('/api/profile')
    expect(res.status).to.equal(200)
    expect(res.body).to.include.all.keys('name', 'bio', 'picture')
  })
})

describe('POST /api/profile', () => {
  it('updates and returns the profile', async () => {
    const res = await request(app)
      .post('/api/profile')
      .send({ name: '  Test User  ', bio: 'Hello' })
    expect(res.status).to.equal(200)
    expect(res.body.name).to.equal('Test User')
    expect(res.body.bio).to.equal('Hello')
  })

  it('rejects an empty name', async () => {
    const res = await request(app).post('/api/profile').send({ name: '   ' })
    expect(res.status).to.equal(400)
    expect(res.body.error).to.equal('Name is required')
  })

  it('updates old posts with new profile', async () => {
    setCurrentUser({
      "fullName": "You",
      "email": "test1@gmail.com",
      "password": "$2b$10$ifW/INM.bIa3duYg7ULQ3ez5UfQQrfvpIyfe6yCU685Yef8L3Orlm",
      "securityQuestion": "What was your first pet's name?",
      "securityAnswer": "$2b$10$V4Sa/QzG6UsCqWyZptohGOfu7GkF3fPm4NaLUxaNWSTdVVRFqC9dO",
      "profile": {
        "name": "You",
        "bio": "Lorem ipsum dolor sit amet",
        "picture": "https://picsum.photos/200?random=2",
        "email": "test1@gmail.com"
      }
    })
    resetPosts()
    const res = await request(app).post('/api/profile')
      .send({ name: 'new name', email: 'test1@gmail.com' })
    expect(res.status).to.equal(200)

    let posts = await request(app).get('/api/posts')
    posts = posts.body.filter(post => post.email === 'test1@gmail.com')
    posts.forEach(post => {
      expect(post.username).to.equal('new name')
    })

    // resetPosts()
    // setCurrentUser(null)
  })
})