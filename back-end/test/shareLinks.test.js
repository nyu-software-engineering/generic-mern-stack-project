import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

// Reuse this link when testing creation and updates.
const testLink = {
  id: 'test-link-216',
  url: 'https://leverage.app/r/test-link-216',
  sharedWith: 'Test landlord',
  createdOn: '2026-11-21',
  active: true,
}

describe('share links routes', () => {
  // The GET route should return the saved links as a list.
  it('GET /share-links returns a list', done => {
    request.execute(app)
      .get('/share-links')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.be.an('array')
        done()
      })
  })

  // The POST route should add a new link and return it.
  it('POST /share-links creates a link', done => {
    request.execute(app)
      .post('/share-links')
      .send(testLink)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(201)
        expect(res.body).to.deep.equal(testLink)
        done()
      })
  })

  // The link update route should save a new name and active status.
  it('POST /share-links/:linkId renames and deactivates a link', done => {
    request.execute(app)
      .post(`/share-links/${testLink.id}`)
      .send({ sharedWith: 'Updated test name', active: false })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body.sharedWith).to.equal('Updated test name')
        expect(res.body.active).to.equal(false)
        done()
      })
  })

  // Updating an ID that is not in the list should return 404.
  it('returns 404 when updating an unknown link', done => {
    request.execute(app)
      .post('/share-links/unknown-link')
      .send({ active: false })
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
  })
})