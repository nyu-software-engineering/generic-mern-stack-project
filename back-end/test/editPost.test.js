import { expect } from 'chai';
import request from 'supertest';
import app, { resetPosts } from '../app.js';

const validEdit = {
    id: 'test1',
    email: 'test1@gmail.com',
    username: 'Carol C.',
    pfp: 'https://picsum.photos/200?random=2',
    category: 'lost',
    title: 'Lost Textbook',
    desc: 'Blue cover, left on the 3rd floor',
    date: '2026-11-02',
    time: '',
    location: 'Bobst Library',
    includeBounty: false,
    bounty: ''
};

describe('POST /api/posts/edit', function() {
    beforeEach(function() {
        resetPosts();
    });

    after(function() {
        resetPosts();
    });

    it('rejects if no title', async function() {
        const res = await request(app).post('/api/posts/edit').send({ ...validEdit, title: '' });
        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal('Title and description are required');
    });

    it('rejects if the description is only whitespace', async function() {
        const res = await request(app).post('/api/posts/edit').send({ ...validEdit, desc: '   ' });
        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal('Title and description are required');
    });

    it('rejects if including a bounty with no bounty', async function() {
        const res = await request(app).post('/api/posts/edit').send({ ...validEdit, includeBounty: true, bounty: '' });
        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal('If including bounty, bounty is required');
    });

    it('rejects if the bounty is whitespace when including a bounty', async function() {
        const res = await request(app).post('/api/posts/edit').send({ ...validEdit, includeBounty: true, bounty: '   ' });
        expect(res.status).to.equal(400);
    });

    it('rejects editing a post that does not exist', async function() {
        const res = await request(app).post('/api/posts/edit').send({ ...validEdit, id: 'does-not-exist' });
        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal('Trying to edit a non existing post');
    });

    it('ignores an empty bounty when not including a bounty', async function() {
        const res = await request(app).post('/api/posts/edit').send({ ...validEdit, bounty: '   ' });
        expect(res.status).to.equal(201);
    });

    it('updates the post in the same spot', async function() {
        let res = await request(app).post('/api/posts/edit').send(validEdit);
        expect(res.status).to.equal(201);
        expect(res.body.title).to.equal('Lost Textbook');
        expect(res.body.desc).to.equal('Blue cover, left on the 3rd floor');

        res = await request(app).get('/api/posts');
        expect(res.body.length).to.equal(2);
        expect(res.body[0].title).to.equal('Lost Textbook');
        expect(res.body.some(p => p.title === 'Lost Book')).to.equal(false);
    });

    it('keeps the same id after editing', async function() {
        let res = await request(app).post('/api/posts/edit').send(validEdit);
        expect(res.body.id).to.equal('test1');

        res = await request(app).get('/api/posts');
        expect(res.body[0].id).to.equal('test1');
    });

    it('does not change the other posts', async function() {
        const before = await request(app).get('/api/posts');
        await request(app).post('/api/posts/edit').send(validEdit);
        const after = await request(app).get('/api/posts');
        expect(after.body[1]).to.deep.equal(before.body[1]);
    });

    it('trims the title and description', async function() {
        const res = await request(app).post('/api/posts/edit')
            .send({ ...validEdit, title: '  Lost Textbook  ', desc: '  Blue cover  ' });
        expect(res.body.title).to.equal('Lost Textbook');
        expect(res.body.desc).to.equal('Blue cover');
    });

    it('defaults the category to lost', async function() {
        const res = await request(app).post('/api/posts/edit').send({ ...validEdit, category: '' });
        expect(res.body.category).to.equal('lost');
    });

    it('keeps the existing image when no new image is uploaded', async function() {
        const res = await request(app).post('/api/posts/edit').send({ ...validEdit, image: '/uploads/old.png' });
        expect(res.body.image).to.equal('/uploads/old.png');
    });
});