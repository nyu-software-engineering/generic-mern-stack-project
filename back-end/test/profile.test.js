import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'

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
})