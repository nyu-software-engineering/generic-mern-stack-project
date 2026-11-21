import { expect } from "chai"
import request from "supertest"
import app from "../app.js"
import { resetMyHobbiesData } from "../routes/myHobbies.js"

describe("My Hobbies API", () => {
  beforeEach(() => {
    resetMyHobbiesData()
  })
      
  it("GET /api/my-hobbies returns joined hobbies and events", async () => {
    const res = await request(app).get("/api/my-hobbies")

    expect(res.status).to.equal(200)
    expect(res.body).to.have.property("joinedHobbies")
    expect(res.body).to.have.property("upcomingEvents")
    expect(res.body).to.have.property("hosting")

    expect(res.body.joinedHobbies).to.be.an("array")
    expect(res.body.upcomingEvents).to.be.an("array")
    expect(res.body.hosting).to.be.an("array")
  })

  //Leave a joined hobby
  it("POST /api/my-hobbies/:id/leave removes a joined hobby", async () => {
    const res = await request(app).post("/api/my-hobbies/1/leave")

    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({
      hobbyId: 1,
      left: true
    })

    const updated = await request(app).get("/api/my-hobbies")

    expect(updated.body.joinedHobbies.some(hobby => hobby.id === 1))
      .to.equal(false)
  })

  // Test leaving an upcoming event
  it("POST /api/my-events/:id/leave removes an upcoming event", async () => {
    const res = await request(app).post("/api/my-events/1/leave")

    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({
      eventId: 1,
      left: true
    })

    const updated = await request(app).get("/api/my-hobbies")

    expect(updated.body.upcomingEvents.some(event => event.id === 1))
      .to.equal(false)
  })

  // Test editing a hosted event
  it("POST /api/my-events/:id/edit updates a hosted event", async () => {
    const res = await request(app)
      .post("/api/my-events/3/edit")
      .send({
        title: "Updated Climbing Meetup",
        location: "Brooklyn Boulders"
      })

    expect(res.status).to.equal(200)
    expect(res.body.title).to.equal("Updated Climbing Meetup")
    expect(res.body.location).to.equal("Brooklyn Boulders")

    const updated = await request(app).get("/api/my-hobbies")

    expect(updated.body.hosting[0].title)
      .to.equal("Updated Climbing Meetup")
  })

  // Test deleting a hosted event
  it("POST /api/my-events/:id/delete removes a hosted event", async () => {
    const res = await request(app).post("/api/my-events/3/delete")

    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({
      eventId: 3,
      deleted: true
    })

    const updated = await request(app).get("/api/my-hobbies")

    expect(updated.body.hosting).to.be.an("array").that.is.empty
  })


})
