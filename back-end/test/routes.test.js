import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js' 

use(chaiHttp)

describe('Flier API Routes', () => {
  describe('POST /api/users/saved-flyers/:id', () => {
    it('should respond with HTTP 201 and confirm the flyer was saved', done => {
      request
        .execute(app)
        .post('/api/users/saved-flyers/42')
        .end((err, res) => {
          expect(err).to.be.null // not null
          expect(res).to.have.status(201) // HTTP response status code
          expect(res).to.be.json // HTTP response content type header
          expect(res.body).to.have.property('status').that.equals('success')
          expect(res.body).to.have.property('savedFlyerId').that.equals('42')
          expect(res.body).to.have.property('flyer')
          done()
        })
    })

    it('should respond with HTTP 404 when flyer is not found', done => {
      request
        .execute(app)
        .post('/api/users/saved-flyers/invalid')
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(404)
          expect(res).to.be.json
          expect(res.body).to.have.property('status').that.equals('error')
          done()
        })
    })
  })

  describe('GET /api/organizations/:id', () => {
    it('should respond with HTTP 200 and return organization details', done => {
      request
        .execute(app)
        .get('/api/organizations/1')
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('id').that.equals('1')
          expect(res.body).to.have.property('name')
          done()
        })
    })

    it('should respond with HTTP 404 when organization is not found', done => {
      request
        .execute(app)
        .get('/api/organizations/999')
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(404)
          expect(res).to.be.json
          expect(res.body).to.have.property('status').that.equals('error')
          done()
        })
    })
  })
})