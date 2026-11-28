import { expect } from 'chai';
import request from 'supertest';
import app, { setCurrentUser } from '../app.js';

// these tests only check the "rejected" cases so mockData.json never gets changed

describe('POST /api/account/create', function() {
  it('rejects an email that already has an account', async function() {
    const res = await request(app)
      .post('/api/account/create')
      .send({ fullName: 'Test', email: 'test@gmail.com', password: 'password123', securityAnswer: 'dog' });
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal('Account with email already exists.');
  });
});

describe('POST /api/account/login', function() {
  afterEach(function() { return setCurrentUser(null); });

  it('rejects an email with no account', async function() {
    const res = await request(app)
      .post('/api/account/login')
      .send({ email: 'nobody@nyu.edu', password: 'password123' });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal('Account with email address does not exist.');
  });

  it('rejects a wrong password', async function() {
    const res = await request(app)
      .post('/api/account/login')
      .send({ email: 'tt@gmail.com', password: 'definitelywrong' });
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal('Password is incorrect');
  });
});

describe('GET /api/profile/security/:email', function() {
  it('rejects an email with no account', async function() {
    const res = await request(app).get('/api/profile/security/nobody@nyu.edu');
    expect(res.status).to.equal(401);
  });

  it('returns the security question for an account', async function() {
    const res = await request(app).get('/api/profile/security/oops@gmail.com');
    expect(res.status).to.equal(200);
    expect(res.body).to.equal("What was your first pet's name?");
  });
});

describe('POST /api/account/recovery', function() {
  it('rejects an email with no account', async function() {
    const res = await request(app)
      .post('/api/account/recovery')
      .send({ email: 'nobody@nyu.edu', answer: 'dog', password: 'newpassword1' });
    expect(res.status).to.equal(400);
  });

  it('rejects a wrong security answer', async function() {
    const res = await request(app)
      .post('/api/account/recovery')
      .send({ email: 'oops@gmail.com', answer: 'definitelywrong', password: 'newpassword1' });
    expect(res.status).to.equal(401);
  });
});