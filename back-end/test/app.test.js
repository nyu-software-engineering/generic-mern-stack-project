import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

it('/ route responds as expected', done => {
  request
    .execute(app)
    .get('/')
    .end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.status(200)
      expect(res.text).to.equal('Leverage back-end is running')
      done()
    })
})
