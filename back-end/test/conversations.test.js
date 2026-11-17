import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'

describe('GET /api/conversations', () => {
  it('responds with a list of conversations', async () => {
    const res = await request(app).get('/api/conversations')
    expect(res.status).to.equal(200)
    expect(res.body).to.be.an('array')
    expect(res.body[0]).to.include.all.keys('id', 'postId', 'username', 'item', 'messages')
  })
})

describe('GET /api/conversations/:id', () => {
  it('responds with one conversation', async () => {
    const res = await request(app).get('/api/conversations/0')
    expect(res.status).to.equal(200)
    expect(res.body.username).to.equal('Alice A.')
  })

  it('responds with 404 for an unknown conversation', async () => {
    const res = await request(app).get('/api/conversations/does-not-exist')
    expect(res.status).to.equal(404)
    expect(res.body.error).to.equal('Conversation not found')
  })
})

describe('POST /api/conversations', () => {
  it('rejects a missing post id', async () => {
    const res = await request(app).post('/api/conversations').send({ item: 'Lost Wallet' })
    expect(res.status).to.equal(400)
    expect(res.body.error).to.equal('Post id is required')
  })

  it('returns the existing conversation for a post', async () => {
    const res = await request(app).post('/api/conversations').send({ postId: 0 })
    expect(res.status).to.equal(200)
    expect(res.body.id).to.equal('0')
  })

  it('starts a new conversation for a new post', async () => {
    const res = await request(app)
      .post('/api/conversations')
      .send({ postId: 99, username: 'Carol C.', item: 'Lost Umbrella' })
    expect(res.status).to.equal(201)
    expect(res.body.postId).to.equal(99)
    expect(res.body.messages).to.deep.equal([])
  })
})

describe('PATCH /api/conversations/:id/read', () => {
  it('marks a conversation as read', async () => {
    const res = await request(app).patch('/api/conversations/0/read')
    expect(res.status).to.equal(200)
    expect(res.body.read).to.equal(true)
  })

  it('responds with 404 for an unknown conversation', async () => {
    const res = await request(app).patch('/api/conversations/does-not-exist/read')
    expect(res.status).to.equal(404)
  })
})

describe('POST /api/conversations/:id/messages', () => {
  it('adds a message from you', async () => {
    const res = await request(app)
      .post('/api/conversations/0/messages')
      .send({ text: '  Yes, I have it!  ' })
    expect(res.status).to.equal(201)
    expect(res.body.text).to.equal('Yes, I have it!')
    expect(res.body.sender).to.equal('you')
    expect(res.body).to.include.all.keys('id', 'time', 'createdAt')

    const convo = await request(app).get('/api/conversations/0')
    expect(convo.body.messages.at(-1).text).to.equal('Yes, I have it!')
  })

  it('marks the chat unread when the other person sends a message', async () => {
    const res = await request(app)
      .post('/api/conversations/0/messages')
      .send({ text: 'Great, where can we meet?', sender: 'other' })
    expect(res.status).to.equal(201)

    const convo = await request(app).get('/api/conversations/0')
    expect(convo.body.read).to.equal(false)
  })

  it('rejects an empty message', async () => {
    const res = await request(app).post('/api/conversations/0/messages').send({ text: '   ' })
    expect(res.status).to.equal(400)
    expect(res.body.error).to.equal('Message text is required')
  })

  it('rejects a missing message', async () => {
    const res = await request(app).post('/api/conversations/0/messages').send({})
    expect(res.status).to.equal(400)
  })

  it('responds with 404 for an unknown conversation', async () => {
    const res = await request(app)
      .post('/api/conversations/does-not-exist/messages')
      .send({ text: 'Hello?' })
    expect(res.status).to.equal(404)
  })
})