import { expect } from 'chai'
import request from 'supertest'
import bcrypt from 'bcrypt'
import app, { setCurrentUser } from '../app.js'

describe('POST /api/account/password', () => {
  it('rejects the change when no one is logged in', async () => {
    setCurrentUser(null)
    const res = await request(app)
      .post('/api/account/password')
      .send({ currentPassword: 'password123', newPassword: 'newpassword1' })
    expect(res.status).to.equal(401)
  })

  describe('when logged in', () => {
    // a fake logged-in user whose password is password123
    beforeEach(async () => {
      const hash = await bcrypt.hash('password123', 10)
      setCurrentUser({ email: 'tester@nyu.edu', password: hash })
    })

    after(() => setCurrentUser(null))

    it('rejects a wrong current password', async () => {
      const res = await request(app)
        .post('/api/account/password')
        .send({ currentPassword: 'wrong', newPassword: 'newpassword1' })
      expect(res.status).to.equal(401)
    })

    it('rejects a new password shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/account/password')
        .send({ currentPassword: 'password123', newPassword: 'short' })
      expect(res.status).to.equal(400)
    })

    it('rejects a new password that is the same as the current one', async () => {
      const res = await request(app)
        .post('/api/account/password')
        .send({ currentPassword: 'password123', newPassword: 'password123' })
      expect(res.status).to.equal(400)
    })

    it('updates the password', async () => {
      const res = await request(app)
        .post('/api/account/password')
        .send({ currentPassword: 'password123', newPassword: 'newpassword1' })
      expect(res.status).to.equal(200)
      expect(res.body.message).to.equal('Password updated')
    })
  })
})