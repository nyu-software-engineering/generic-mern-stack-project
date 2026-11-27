import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'
import { resetPosts } from '../app.js'

describe('DELETE /api/posts/:id', () => {
	beforeEach(() => {
		resetPosts()
	})

  it('rejects if no valid post id found', async () => {
    const res = await request(app).delete('/api/posts/-1')
    expect(res.status).to.equal(404)
    expect(res.body).to.deep.equal({ error: 'Post id not found' })
  })

	it('deletes if post id is found', async () => {
    const res = await request(app).delete('/api/posts/test1')
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({ message: 'success delete' })
  })
})
