import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'
import { storage } from '../app.js'

describe('GET /api/posts', () => {
  it('responds with a list of posts', async () => {
    const res = await request(app).get('/api/posts')
    expect(res.status).to.equal(200)
    expect(res.body).to.be.an('array')
  })
})

describe('POST /api/posts', () => {
  it('rejects if no title', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: '', desc: 'placeholder', includeBounty: false, bounty: 'placeholder' })
    expect(res.status).to.equal(400)
  })

  it('rejects if no description', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'placeholder', desc: ' ', includeBounty: false, bounty: 'placeholder' })
    expect(res.status).to.equal(400)
  })

  it('ignores empty bounty if not including bounty', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'title', desc: 'desc', includeBounty: false, bounty: ' ' })
    expect(res.status).to.equal(201)
  })

  it('rejects if no bounty when including bounty', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'title', desc: 'desc', includeBounty: true, bounty: '' })
    expect(res.status).to.equal(400)
  })

  it('rejects if bounty is whitespace when including bounty', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'title', desc: 'desc', includeBounty: true, bounty: ' ' })
    expect(res.status).to.equal(400)
  })

  it('saves uploaded images in public/uploads', async () => {
    let x
    let y

    const cb = (arg1, arg2) => {
      x = arg1
      y = arg2
    }

    storage.getDestination({}, {}, cb)
    
    expect(x).to.equal(null)
    expect(y).to.equal('public/uploads')
  })

  it('names uploaded images based on current time', async () => {
    let x
    let y

    const file = {
      fieldname: 'test', 
      originalname: 'test.png'
    }

    const date = Date.now()

    const cb = (arg1, arg2) => {
      x = arg1
      y = arg2
    }

    storage.getFilename({}, file, cb)
    
    expect(x).to.equal(null)
    expect(y).to.equal(`test-${date}.png`)
  })

  it('adds a new post to home', async () => {
    const post = { title: 'Lost Keys', desc: 'Please help, I lost my keys!', 
        category: 'lost', location: 'Bobst Library', date: '2026-11-02' }
    const res = await request(app).post('/api/posts').send(post)
    expect(res.status).to.equal(201)
    expect(res.body).to.deep.equal(post)
  })
})
