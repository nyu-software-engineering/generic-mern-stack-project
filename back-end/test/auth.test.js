import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';

describe('Hotel Planner Authentication API', function () {
  // Test 1: Successful login
  it('should log in with valid credentials', async function () {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@hotelplanner.com',
      password: 'password123',
    });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Login successful');
    expect(response.body.user.email).to.equal('test@hotelplanner.com');
  });

  // Test 2: Incorrect password
  it('should reject an incorrect password', async function () {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@hotelplanner.com',
      password: 'wrongpassword',
    });

    expect(response.status).to.equal(401);
    expect(response.body.error).to.equal('Invalid email or password');
  });

  // Test 3: Missing credentials
  it('should reject missing credentials', async function () {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: '' });

    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('Email and password are required');
  });

  // Test 4: Unauthenticated user
  it('should prevent unauthenticated access', async function () {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).to.equal(401);
    expect(response.body.error).to.equal('Not authenticated');
  });

  // Test 5: Session authentication
  it('should preserve login session', async function () {
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'test@hotelplanner.com',
      password: 'password123',
    });

    const response = await agent.get('/api/auth/me');

    expect(response.status).to.equal(200);
    expect(response.body.authenticated).to.equal(true);
  });

  // Test 6: Logout
  it('should log out successfully', async function () {
    const agent = request.agent(app);

    await agent.post('/api/auth/login').send({
      email: 'test@hotelplanner.com',
      password: 'password123',
    });

    const logout = await agent.post('/api/auth/logout');
    expect(logout.status).to.equal(200);
    expect(logout.body.message).to.equal('Logged out successfully');

    const check = await agent.get('/api/auth/me');
    expect(check.status).to.equal(401);
  });
});
