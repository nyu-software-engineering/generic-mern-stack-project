import { use, expect } from 'chai';
import { default as chaiHttp, request } from 'chai-http';
import app from '../app.js';

use(chaiHttp);

describe('Current bookings routes', () => {
  describe('GET /api/bookings', () => {
    it('gets the list of bookings', (done) => {
      request
        .execute(app)
        .get('/api/bookings')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          res.body.forEach((booking) => {
            expect(booking).to.include.keys('id', 'name', 'location', 'checkIn', 'checkOut', 'description');
          });
          done();
        });
    });
  });

  describe('POST /api/bookings', () => {
    it('add new hotel to the bookings list', (done) => {
      const newBooking = { id: 'BOOK-TEST', name: 'Test Booking Hotel', location: 'Testville' };
      request
        .execute(app)
        .post('/api/bookings')
        .send(newBooking)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.include({ id: 'BOOK-TEST', name: 'Test Booking Hotel' });

          request
            .execute(app)
            .get('/api/bookings')
            .end((err2, list) => {
              const ids = list.body.map((b) => b.id);
              expect(ids).to.include('BOOK-TEST');
              done();
            });
        });
    });

    it('doesnt book same hotel twice', (done) => {
      const newBooking = { id: 'BOOK-TWICE', name: 'Double Booked Inn', location: 'Testville' };
      request
        .execute(app)
        .post('/api/bookings')
        .send(newBooking)
        .end(() => {
          request
            .execute(app)
            .post('/api/bookings')
            .send(newBooking)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.body.id).to.equal('BOOK-TWICE');

              request
                .execute(app)
                .get('/api/bookings')
                .end((err2, list) => {
                  const matches = list.body.filter((b) => b.id === 'BOOK-TWICE');
                  expect(matches).to.have.length(1);
                  done();
                });
            });
        });
    });

    it('responds 400 when id or name is missing', (done) => {
      request
        .execute(app)
        .post('/api/bookings')
        .send({ location: 'Nowhere' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });

  describe('POST /api/bookings/:id', () => {
    it('updates the notes and dates of a booking', (done) => {
      const testBooking = { id: 'UPDATE-BOOKING', name: 'Update Test Hotel', location: 'Testville' };
      const changes = { description: 'Late check-in', checkIn: '2027-01-10', checkOut: '2027-01-14' };
      request
        .execute(app)
        .post('/api/bookings')
        .send(testBooking)
        .end(() => {
          request
            .execute(app)
            .post('/api/bookings/UPDATE-BOOKING')
            .send(changes)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.body).to.include(changes);

              request
                .execute(app)
                .get('/api/bookings')
                .end((err2, list) => {
                  const booking = list.body.find((b) => b.id === 'UPDATE-BOOKING');
                  expect(booking).to.include(changes);
                  done();
                });
            });
        });
    });

    it('responds 400 when notes or dates are an issue/missing', (done) => {
      request
        .execute(app)
        .post('/api/bookings/UPDATE-BOOKING')
        .send({ description: 'only notes' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('responds 404 for a booking that does not exist', (done) => {
      request
        .execute(app)
        .post('/api/bookings/NOBOOKING')
        .send({ description: 'crash', checkIn: '', checkOut: '' })
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('removes a booking', (done) => {
      const testBooking = { id: 'DELETE-BOOKING', name: 'Delete Test Hotel', location: 'Testville' };
      request
        .execute(app)
        .post('/api/bookings')
        .send(testBooking)
        .end(() => {
          request
            .execute(app)
            .delete('/api/bookings/DELETE-BOOKING')
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.body).to.include({ id: 'DELETE-BOOKING' });

              request
                .execute(app)
                .get('/api/bookings')
                .end((err2, list) => {
                  const ids = list.body.map((b) => b.id);
                  expect(ids).to.not.include('DELETE-BOOKING');
                  done();
                });
            });
        });
    });

    it('responds 404 for a booking that does not exist', (done) => {
      request
        .execute(app)
        .delete('/api/bookings/NOBOOKING')
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });
});