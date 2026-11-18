import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'

describe('GET /api/notifications', () => {
  it('responds with a list of notifications', async () => {
    const res = await request(app).get('/api/notifications')
    expect(res.status).to.equal(200)
    expect(res.body).to.be.an('array')
  })
})

describe('PATCH /api/notifications/:id/read', () => {
  it('marks one notification as read', async () => {
    const list = await request(app).get('/api/notifications')
    const id = list.body[0].id
    const res = await request(app).patch(`/api/notifications/${id}/read`)
    expect(res.status).to.equal(200)
    expect(res.body.id).to.equal(id)
    expect(res.body.read).to.equal(true)
  })

  it('responds with 404 for an unknown notification', async () => {
    const res = await request(app).patch('/api/notifications/does-not-exist/read')
    expect(res.status).to.equal(404)
    expect(res.body.error).to.equal('Notification not found')
  })
})

describe('PATCH /api/notifications/read-all', () => {
  it('marks every notification as read', async () => {
    const res = await request(app).patch('/api/notifications/read-all')
    expect(res.status).to.equal(200)
    expect(res.body.every(n => n.read)).to.equal(true)
  })
})