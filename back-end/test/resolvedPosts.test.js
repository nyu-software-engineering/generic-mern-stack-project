import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/posts/resolved', function() {
  it('responds with a list of resolved posts', async function() {
    const res = await request(app).get('/api/posts/resolved');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });
});

describe('POST /api/posts/resolved', function() {
  it('adds a resolved post to the history', async function() {
    const post = { title: 'Lost Keys', category: 'lost', location: 'Bobst Library', date: '2026-11-02' };
    const res = await request(app).post('/api/posts/resolved').send(post);
    expect(res.status).to.equal(201);
    expect(res.body).to.deep.equal(post);

    const history = await request(app).get('/api/posts/resolved');
    expect(history.body[0]).to.deep.equal(post);
  });

  it('rejects a post without a title', async function() {
    const res = await request(app).post('/api/posts/resolved').send({ category: 'lost' });
    expect(res.status).to.equal(400);
  });
});
