import { use, expect } from 'chai';
import { default as chaiHttp, request } from 'chai-http';
import app from '../app.js';

use(chaiHttp);

describe('Saved hotels routes', () => {
  describe('GET /api/saved', () => {
    it('gets the list of hotel', (done) => {

      request
        .execute(app)
        .get('/api/saved')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          res.body.forEach((hotel) => {
            expect(hotel).to.include.keys('id', 'name', 'location', 'date', 'description');
          });
          done();
        });
    });
  });

  describe('POST /api/saved', () => {
    it('add new hotel to the saved list', (done) => {
      const newHotel = { id: 'testy-tester-hotel', name: 'The Big Egg', location: 'Smallville, Kansas' };
      request
        .execute(app)
        .post('/api/saved')
        .send(newHotel)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.include({ id: 'testy-tester-hotel', name: 'The Big Egg' });

          //check if add is successfull
          request
            .execute(app)
            .get('/api/saved')
            .end((err2, res) => {
              const ids = res.body.map((h) => h.id);
              expect(ids).to.include('testy-tester-hotel');
              done();
            });
        });
    });

    it('doesnt add same hotel twice', (done) => {
      const newHotel = { id: 'SUPERCHURRO', name: 'Churrovania', location: 'New York, New York' };
      request
        .execute(app)
        .post('/api/saved')
        .send(newHotel)
        .end(() => {
          request
            .execute(app)
            .post('/api/saved')
            .send(newHotel)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.body.id).to.equal('SUPERCHURRO');
              request
                .execute(app)
                .get('/api/saved')
                .end((err2, list) => {
                  const matches = list.body.filter((h) => h.id === 'SUPERCHURRO');
                  expect(matches).to.have.length(1);
                  done();
                });
            });
        });
    });

    it('responds 400 when id or name is missing', (done) => {
      request
        .execute(app)
        .post('/api/saved')
        .send({ location: 'Nowhere' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });

  describe('POST /api/saved/:id', () => {
    it('updates the description of a saved hotel', (done) => {
      const testHotel = { id: 'UPDATE-ME', name: 'Update test motel', location: 'Testville' };
      request
        .execute(app)
        .post('/api/saved')
        .send(testHotel)
        .end(() => {

          request
            .execute(app)
            .post('/api/saved/UPDATE-ME')
            .send({ description: 'Updated by a test' })
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.body).to.have.property('description', 'Updated by a test');

              request
                .execute(app)
                .get('/api/saved')
                .end((err2, list) => {
                  const hotel = list.body.find((h) => h.id === 'UPDATE-ME');
                  expect(hotel.description).to.equal('Updated by a test');
                  done();
                });
            });
        });
    });

    it('responds 400 when description is an issue/missing', (done) => {
      request
        .execute(app)
        .post('/api/saved/UPDATE-ME')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('responds 404 for a hotel that is not saved', (done) => {
      request
        .execute(app)
        .post('/api/saved/NOHOTEL')
        .send({ description: 'crash' })
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('DELETE /api/saved/:id', () => {
    it('removes a saved hotel', (done) => {
      const testHotel = { id: 'DELETE-ME', name: 'Delete Test Inn', location: 'Testville' };
      request
        .execute(app)
        .post('/api/saved')
        .send(testHotel)
        .end(() => {
          request
            .execute(app)
            .delete('/api/saved/DELETE-ME')
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.body).to.include({ id: 'DELETE-ME' });

              request
                .execute(app)
                .get('/api/saved')
                .end((err2, list) => {
                  const ids = list.body.map((h) => h.id);
                  expect(ids).to.not.include('DELETE-ME');
                  done();
                });
            });
        });
    });

    it('responds 404 for a hotel that is not saved', (done) => {
      request
        .execute(app)
        .delete('/api/saved/KJSJNJDSF')
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });
});