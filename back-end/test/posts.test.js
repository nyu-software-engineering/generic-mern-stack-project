import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';
import { storage, resetPosts } from '../app.js';

describe('GET /api/posts', function() {
  it('responds with a list of posts', async function() {
    resetPosts();
    const res = await request(app).get('/api/posts');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(2);
  });
});

describe('POST /api/posts', function() {
  beforeEach(function() {
    resetPosts();
  });

  it('rejects if no title', async function() {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: '', desc: 'placeholder', includeBounty: false, bounty: 'placeholder' });
    expect(res.status).to.equal(400);
  });

  it('rejects if no description', async function() {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'placeholder', desc: ' ', includeBounty: false, bounty: 'placeholder' });
    expect(res.status).to.equal(400);
  });

  it('ignores empty bounty if not including bounty', async function() {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'title', desc: 'desc', includeBounty: false, bounty: ' ' });
    expect(res.status).to.equal(201);
  });

  it('rejects if no bounty when including bounty', async function() {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'title', desc: 'desc', includeBounty: true, bounty: '' });
    expect(res.status).to.equal(400);
  });

  it('rejects if bounty is whitespace when including bounty', async function() {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'title', desc: 'desc', includeBounty: true, bounty: ' ' });
    expect(res.status).to.equal(400);
  });

  it('saves uploaded images in public/uploads', async function() {
    let x;
    let y;

    const cb = (arg1, arg2) => {
      x = arg1;
      y = arg2;
    };

    storage.getDestination({}, {}, cb);
    
    expect(x).to.equal(null);
    expect(y).to.equal('public/uploads');
  });

  it('names uploaded images based on current time', async function() {
    let x;
    let y;

    const file = {
      fieldname: 'test', 
      originalname: 'test.png'
    };

    const date = Date.now();

    const cb = (arg1, arg2) => {
      x = arg1;
      y = arg2;
    };

    storage.getFilename({}, file, cb);
    
    expect(x).to.equal(null);
    expect(y).to.equal(`test-${date}.png`);
  });

  it('adds a new post to home', async function() {
    let post = { title: 'Lost Keys', desc: 'Please help, I lost my keys!', 
        category: 'lost', location: 'Bobst Library', date: '2026-11-02' };
    let res = await request(app).post('/api/posts').send(post);
    expect(res.status).to.equal(201);
    expect(res.body).to.include(post);

    post = res.body;
    res = await request(app).get('/api/posts');
    expect(res.status).to.equal(200);
    expect(res.body[0]).to.deep.equal(post);
    expect(res.body.length).to.equal(3);

    // reset posts in case someone else's tests do smth with mockData's posts
    resetPosts();
  });
});
