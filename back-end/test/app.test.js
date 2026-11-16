import { describe, it } from 'mocha'
import { expect } from 'chai'
import request from 'supertest'
import app from '../src/app.js'

describe('Express API setup', () => {
  it('reports that the API is running', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).to.equal(200)
    expect(response.headers['content-type']).to.match(/json/)
    expect(response.body).to.deep.equal({ status: 'ok' })
  })

  for (const path of ['register', 'login', 'logout', 'forgot-password', 'reset-password']) {
    it(`exposes POST /api/auth/${path} without claiming auth is implemented`, async () => {
      const response = await request(app)
        .post(`/api/auth/${path}`)
        .send({ email: 'learner@example.com', password: 'example-password' })

      expect(response.status).to.equal(501)
      expect(response.body.error.code).to.equal('NOT_IMPLEMENTED')
      expect(response.body.error.message).to.be.a('string').and.not.be.empty
      expect(response.headers['set-cookie']).to.equal(undefined)
      expect(JSON.stringify(response.body)).not.to.include('example-password')
    })
  }

  it('returns JSON for unknown routes', async () => {
    const response = await request(app).get('/api/unknown')

    expect(response.status).to.equal(404)
    expect(response.body.error.code).to.equal('NOT_FOUND')
  })

  it('does not expose login through GET requests', async () => {
    const response = await request(app).get('/api/auth/login')

    expect(response.status).to.equal(404)
    expect(response.body.error.code).to.equal('NOT_FOUND')
  })

  it('rejects malformed JSON without exposing its contents', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"password":"private-value",')

    expect(response.status).to.equal(400)
    expect(response.body).to.deep.equal({
      error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' },
    })
    expect(JSON.stringify(response.body)).not.to.include('private-value')
  })

  it('rejects JSON bodies larger than 10 KB', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'a'.repeat(11 * 1024) })

    expect(response.status).to.equal(413)
    expect(response.body.error.code).to.equal('BODY_TOO_LARGE')
  })
})
