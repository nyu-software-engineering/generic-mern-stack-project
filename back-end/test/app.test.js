import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/mockData', function() {
  it('responds with status 200 and JSON', async function() {
    const res = await request(app).get('/api/mockData');
    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('application/json');
  });

  it('includes posts, conversations, notifications and profile', async function() {
    const res = await request(app).get('/api/mockData');
    expect(res.body).to.include.all.keys('posts', 'conversations', 'notifications', 'profile');
    expect(res.body.posts).to.be.an('array');
  });
});
