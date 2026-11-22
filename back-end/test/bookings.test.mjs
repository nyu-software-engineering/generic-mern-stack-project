import { expect } from 'chai'
import { request } from 'chai-http'
import app from '../app.js'

// Sprint 2: mock-data booking API tests. Use future dates to avoid fixture bookings.
const api = '/api/bookings'
const serviceId = '2' // Python tutoring: Tuesday/Thursday, 16:00–19:00
const tuesday = '2027-02-02'
const thursday = '2027-02-04'
const createBooking = (date, time) => request.execute(app).post(api).send({ serviceId, date, time, notes: 'Test booking' })

describe('Sprint 2 booking API', () => {
  it('retrieves the booking list', async () => {
    const response = await request.execute(app).get(api)
    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('array')
  })

  it('uses the provider schedule for available slots', async () => {
    const available = await request.execute(app).get(`${api}/availability`).query({ serviceId, date: tuesday })
    expect(available.status).to.equal(200)
    expect(available.body.slots).to.deep.equal(['16:00', '16:30', '17:00', '17:30', '18:00', '18:30'])
    const unavailable = await request.execute(app).get(`${api}/availability`).query({ serviceId, date: '2027-02-01' })
    expect(unavailable.status).to.equal(200)
    expect(unavailable.body.slots).to.deep.equal([])
  })

  it('creates and retrieves a booking', async () => {
    const created = await createBooking(tuesday, '16:00')
    expect(created.status).to.equal(201)
    expect(created.body).to.include({ serviceId, date: tuesday, time: '16:00' })
    const fetched = await request.execute(app).get(`${api}/${created.body.id}`)
    expect(fetched.status).to.equal(200)
    expect(fetched.body.id).to.equal(created.body.id)
  })

  it('prevents double-booking the same slot', async () => {
    const first = await createBooking(tuesday, '16:30')
    expect(first.status).to.equal(201)
    const duplicate = await createBooking(tuesday, '16:30')
    expect(duplicate.status).to.equal(409)
  })

  it('reschedules a booking', async () => {
    const created = await createBooking(tuesday, '17:00')
    expect(created.status).to.equal(201)
    const updated = await request.execute(app).patch(`${api}/${created.body.id}`).send({ date: thursday, time: '17:00', status: 'requested' })
    expect(updated.status).to.equal(200)
    expect(updated.body).to.include({ date: thursday, time: '17:00' })
  })

  it('cancels a booking and frees its slot', async () => {
    const created = await createBooking(thursday, '18:00')
    expect(created.status).to.equal(201)
    const cancelled = await request.execute(app).patch(`${api}/${created.body.id}`).send({ status: 'cancelled' })
    expect(cancelled.status).to.equal(200)
    const available = await request.execute(app).get(`${api}/availability`).query({ serviceId, date: thursday })
    expect(available.body.slots).to.include('18:00')
  })
})
