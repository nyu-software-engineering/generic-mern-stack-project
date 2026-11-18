import { expect } from "chai"
import request from "supertest"
import app from "../app.js"

describe("Discover routes", () => {
  describe("GET /api/hobbies", () => {
    it("returns a list of hobbies", async () => {
      const res = await request(app).get("/api/hobbies")
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an("array")
      expect(res.body.length).to.be.greaterThan(0)
      expect(res.body[0]).to.have.property("name")
    })
  })

  describe("GET /api/hobbies/:id", () => {
    it("returns one hobby when the id exists", async () => {
      const res = await request(app).get("/api/hobbies/1")
      expect(res.status).to.equal(200)
      expect(res.body.id).to.equal(1)
      expect(res.body.name).to.equal("Bouldering")
    })

    it("returns 404 when the hobby does not exist", async () => {
      const res = await request(app).get("/api/hobbies/999")
      expect(res.status).to.equal(404)
      expect(res.body.error).to.equal("Hobby not found")
    })
  })

  describe("GET /api/hobbies/:id/events", () => {
    it("returns only events for that hobby", async () => {
      const res = await request(app).get("/api/hobbies/1/events")
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an("array")
      res.body.forEach(event => {
        expect(event.hobbyId).to.equal(1)
      })
    })
  })

  describe("GET /api/events/:id", () => {
    it("returns one event when the id exists", async () => {
      const res = await request(app).get("/api/events/2")
      expect(res.status).to.equal(200)
      expect(res.body.id).to.equal(2)
      expect(res.body.title).to.equal("Sunday Outdoor Climb")
    })

    it("returns 404 when the event does not exist", async () => {
      const res = await request(app).get("/api/events/999")
      expect(res.status).to.equal(404)
      expect(res.body.error).to.equal("Event not found")
    })
  })

  describe("POST /api/hobbies/:id/join", () => {
    it("confirms joining a hobby", async () => {
      const res = await request(app).post("/api/hobbies/1/join")
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ hobbyId: 1, joined: true })
    })

    it("returns 404 when joining a hobby that does not exist", async () => {
      const res = await request(app).post("/api/hobbies/999/join")
      expect(res.status).to.equal(404)
    })
  })

  describe("POST /api/events/:id/join", () => {
    it("confirms joining an event", async () => {
      const res = await request(app).post("/api/events/3/join")
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ eventId: 3, joined: true })
    })

    it("returns 404 when joining an event that does not exist", async () => {
      const res = await request(app).post("/api/events/999/join")
      expect(res.status).to.equal(404)
    })
  })
})