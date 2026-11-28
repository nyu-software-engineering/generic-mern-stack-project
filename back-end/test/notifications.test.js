import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/notifications', function() {
  it('responds with a list of notifications', async function() {
    const res = await request(app).get('/api/notifications');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });
});

describe('PATCH /api/notifications/:id/read', function() {
  it('marks one notification as read', async function() {
    const list = await request(app).get('/api/notifications');
    const id = list.body[0].id;
    const res = await request(app).patch(`/api/notifications/${id}/read`);
    expect(res.status).to.equal(200);
    expect(res.body.id).to.equal(id);
    expect(res.body.read).to.equal(true);
  });

  it('responds with 404 for an unknown notification', async function() {
    const res = await request(app).patch('/api/notifications/does-not-exist/read');
    expect(res.status).to.equal(404);
    expect(res.body.error).to.equal('Notification not found');
  });
});

describe('PATCH /api/notifications/read-all', function() {
  it('marks every notification as read', async function() {
    const res = await request(app).patch('/api/notifications/read-all');
    expect(res.status).to.equal(200);
    expect(res.body.every(n => n.read)).to.equal(true);
  });
});

describe('notifications for new messages', function() {
  let convoId;

  before(async function() {
    const res = await request(app)
      .post('/api/conversations')
      .send({ postId: 'notification-test-post', username: 'Test User', item: 'Test Item' });
    convoId = res.body.id;
  });

  it('creates a notification when the other person sends a message', async function() {
    await request(app)
      .post(`/api/conversations/${convoId}/messages`)
      .send({ text: 'I found it!', sender: 'other' });
    const res = await request(app).get('/api/notifications');
    const newest = res.body[0];
    expect(newest.path).to.equal(`/messages/${convoId}`);
    expect(newest.title).to.equal('New message • Test User');
    expect(newest.description).to.equal('About Test Item: I found it!');
    expect(newest.read).to.equal(false);
  });

  it('does not create a notification for your own messages', async function() {
    const start = await request(app).get('/api/notifications');
    await request(app)
      .post(`/api/conversations/${convoId}/messages`)
      .send({ text: 'Thank you!' });
    const end = await request(app).get('/api/notifications');
    expect(end.body.length).to.equal(start.body.length);
  });
});