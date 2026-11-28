import { expect } from 'chai';
import request from 'supertest';
import app, { setCurrentUser, resetPosts } from '../app.js';

// a fake logged-in user with a profile
const testUser = () => ({
  email: 'tester@nyu.edu',
  profile: { name: 'Tester', bio: 'Hi', picture: '/uploads/test.png' }
});

describe('GET /api/profile', function() {
  afterEach(function() { return setCurrentUser(null); });

  it('rejects when no one is logged in', async function() {
    const res = await request(app).get('/api/profile');
    expect(res.status).to.equal(401);
  });

  it('responds with the logged-in user profile', async function() {
    setCurrentUser(testUser());
    const res = await request(app).get('/api/profile');
    expect(res.status).to.equal(200);
    expect(res.body).to.include.all.keys('name', 'bio', 'picture');
  });
});

describe('POST /api/profile', function() {
  beforeEach(function() { return setCurrentUser(testUser()); });
  afterEach(function() { return setCurrentUser(null); });

  it('updates and returns the profile', async function() {
    const res = await request(app)
      .post('/api/profile')
      .send({ name: '  Test User  ', bio: 'Hello' });
    expect(res.status).to.equal(200);
    expect(res.body.name).to.equal('Test User');
    expect(res.body.bio).to.equal('Hello');
  });

  it('keeps the old picture when no new one is uploaded', async function() {
    const res = await request(app)
      .post('/api/profile')
      .send({ name: 'Test User', bio: 'Hello' });
    expect(res.body.picture).to.equal('/uploads/test.png');
  });

  it('rejects an empty name', async function() {
    const res = await request(app).post('/api/profile').send({ name: '   ' });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal('Name is required');
  });

  it('rejects when no one is logged in', async function() {
    setCurrentUser(null);
    const res = await request(app).post('/api/profile').send({ name: 'Test User' });
    expect(res.status).to.equal(401);
  });

  it('updates old posts with new profile', async function() {
    setCurrentUser({
      "fullName": "Carol Carol",
      "email": "test1@gmail.com",
      "password": "$2b$10$ifW/INM.bIa3duYg7ULQ3ez5UfQQrfvpIyfe6yCU685Yef8L3Orlm",
      "securityQuestion": "What was your first pet's name?",
      "securityAnswer": "$2b$10$V4Sa/QzG6UsCqWyZptohGOfu7GkF3fPm4NaLUxaNWSTdVVRFqC9dO",
      "profile": {
        "name": "Carol C.",
        "bio": "Lorem ipsum dolor sit amet",
        "picture": "https://picsum.photos/200?random=2",
        "email": "test1@gmail.com"
      }
    });
    resetPosts();
    const res = await request(app).post('/api/profile')
      .send({ name: 'new name', email: 'test1@gmail.com' });
    expect(res.status).to.equal(200);

    let posts = await request(app).get('/api/posts');
    posts = posts.body.filter(post => post.email === 'test1@gmail.com');
    posts.forEach(post => {
      expect(post.username).to.equal('new name');
    });

    resetPosts();
    setCurrentUser(null);
  });
});