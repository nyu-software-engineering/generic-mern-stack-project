import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/user', function() {
  it('responds with the user', async function() {
    const res = await request(app).get('/api/user');
    expect(res.status).to.equal(200);
    expect(res.body).to.include.all.keys('name', 'bio', 'picture', 'email');
  });
});