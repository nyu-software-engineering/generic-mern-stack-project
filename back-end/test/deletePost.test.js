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
    const res = await request(app).delete('/api/posts/1')
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({ message: 'success delete' })
  })

	it('decrements post ids for posts after this post', async () => {
		// adds new post to check that its id decrements later
		const post = { id: 2, category: 'lost', title: 'decrement', desc: 'desc', 
			includeBounty: false, bounty: ' ' }
		let res = await request(app)
			.post('/api/posts')
			.send(post)

		res = await request(app).delete('/api/posts/1')
		expect(res.status).to.equal(200)

		// don't forget mockData is included in origin res.body
		res = await request(app).get('/api/posts')
		expect(res.status).to.equal(200)
		expect(res.body).to.be.an('array')
		expect(res.body.length).to.equal(2)
		expect(res.body[0]).to.deep.equal({ id: 1, category: 'lost', title: 'decrement', 
			desc: 'desc', includeBounty: false, bounty: ' ' })
		
		// reset posts in case someone else's tests do smth with mockData's posts
		resetPosts()
	})
})
