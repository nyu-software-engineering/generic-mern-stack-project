import { use, expect } from 'chai';
import { default as chaiHttp, request } from 'chai-http';
import app from '../app.js';

use(chaiHttp);

describe('Profile API', () => {
    describe('GET /api/profile/stays without authentication', () => {
        it('gets the list of hotel stays for the logged-in user', async () => {
            const response = await request.execute(app).get("/api/profile/stays");
            expect(response.status).to.equal(401);
            expect(response.body.error).to.equal("Not authenticated");
        }); 
    });

    describe('GET /api/profile/stays with authentication', () => {
        let agent;

        beforeEach(async () => {
            agent = request.agent(app);
            const login = await agent
                .post("/api/auth/login")
                .send({ email: "test@hotelplanner.com", password: "password123" });
            expect(login.status).to.equal(200);
        });

        it('gets the list of hotel stays for the logged-in user', async () => {
            const response = await agent.get("/api/profile/stays");
            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array').that.is.not.empty;
        });

        it('gets the list of hotel stays for only the logged-in user and not for other users', async () => {
            const response = await agent.get("/api/profile/stays");
            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array').that.is.not.empty;

            // Check that all stays belong to the logged-in user (userId: '1')
            response.body.forEach((stay) => {
                expect(stay.userId).to.equal('1');
            });

            // Check that stays for other users are not included
            const otherUserStay = response.body.find((stay) => stay.userId !== '1');
           expect(otherUserStay).to.be.undefined;
        }); 

        it('should have the correct structure for each stay', async () => {
            const response = await agent.get("/api/profile/stays");
            expect(response.status).to.equal(200);

            response.body.forEach((stay) => {
                expect(stay).to.have.all.keys('id', 'userId', 'hotel', 'city', 'date');
                expect(stay.id).to.be.a('string');
                expect(stay.userId).to.be.a('string');
                expect(stay.hotel).to.be.a('string');
                expect(stay.city).to.be.a('string');
                expect(stay.date).to.be.a('string');
                expect(stay.userId).to.equal('1');
            });
        });

        it('should have the correct number of stays for the logged-in user', async () => {
            const response = await agent.get('/api/profile/stays');
            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array').that.is.not.empty;

            expect(response.body.length).to.equal(3);
        });

        it ('should return YYYY-MM-DD format', async () => {
            const response = await agent.get('/api/profile/stays');
            expect(response.status).to.equal(200);
            response.body.forEach((stay) => {
                expect(stay.date).to.match(/^\d{4}-\d{2}-\d{2}$/);
            });
        });

        it('should block access to stays after logout', async () => {
            const before = await agent.get('/api/profile/stays');
            expect(before.status).to.equal(200);

            const logout = await agent.post('/api/auth/logout');
            expect(logout.status).to.equal(200);

            const after = await agent.get('/api/profile/stays');
            expect(after.status).to.equal(401);
            expect(after.body.error).to.equal("Not authenticated");
        });
    });
});

