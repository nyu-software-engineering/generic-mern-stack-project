const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../app")
const roommateService = require("../services/roommateService")

chai.use(chaiHttp)
chai.should()

describe("DELETE /api/households/:householdId/members/:memberId", () => {
  // the route uses roommateService.removeRoommate, so tests swap it for a fake to avoid calling Mockaroo
  const originalRemoveRoommate = roommateService.removeRoommate

  afterEach(() => {
    roommateService.removeRoommate = originalRemoveRoommate
  })

  it("should return 200 with the removed roommate", (done) => {
    roommateService.removeRoommate = async () => ({
      removed: { id: 2, firstName: "Ben", lastName: "Park", householdId: 1 },
    })

    chai
      .request(server)
      .delete("/api/households/1/members/2")
      .send({ requesterId: 1 })
      .end((err, res) => {
        res.should.have.status(200)
        res.body.removed.id.should.equal(2)
        res.body.removed.firstName.should.equal("Ben")
        done()
      })
  })

  it("should pass the ids from the URL and body to the service", (done) => {
    let received = null
    roommateService.removeRoommate = async (input) => {
      received = input
      return { removed: { id: 2 } }
    }

    chai
      .request(server)
      .delete("/api/households/1/members/2")
      .send({ requesterId: 1 })
      .end(() => {
        received.should.deep.equal({ householdId: "1", memberId: "2", requesterId: 1 })
        done()
      })
  })

  it("should return 400 when an id is not a number", (done) => {
    chai
      .request(server)
      .delete("/api/households/abc/members/2")
      .send({ requesterId: 1 })
      .end((err, res) => {
        res.should.have.status(400)
        res.body.error.should.equal("householdId, memberId and requesterId must be numbers")
        done()
      })
  })

  it("should return 403 when the person removing is not in the household", (done) => {
    roommateService.removeRoommate = async () => ({
      status: 403,
      error: "Only members of this household can remove roommates",
    })

    chai
      .request(server)
      .delete("/api/households/1/members/2")
      .send({ requesterId: 3 })
      .end((err, res) => {
        res.should.have.status(403)
        res.body.error.should.equal("Only members of this household can remove roommates")
        done()
      })
  })

  it("should return 404 when the roommate is not in the household", (done) => {
    roommateService.removeRoommate = async () => ({
      status: 404,
      error: "This person is not a member of the household",
    })

    chai
      .request(server)
      .delete("/api/households/1/members/3")
      .send({ requesterId: 1 })
      .end((err, res) => {
        res.should.have.status(404)
        done()
      })
  })

  it("should return 409 when the roommate has an outstanding balance", (done) => {
    roommateService.removeRoommate = async () => ({
      status: 409,
      error: "Ben still has an outstanding balance of $42.50. Settle it before removing them.",
    })

    chai
      .request(server)
      .delete("/api/households/1/members/2")
      .send({ requesterId: 1 })
      .end((err, res) => {
        res.should.have.status(409)
        res.body.error.should.include("outstanding balance")
        done()
      })
  })

  it("should return 502 when the mock API cannot be reached", (done) => {
    roommateService.removeRoommate = async () => {
      throw new Error("Mockaroo is down")
    }

    chai
      .request(server)
      .delete("/api/households/1/members/2")
      .send({ requesterId: 1 })
      .end((err, res) => {
        res.should.have.status(502)
        done()
      })
  })
})
