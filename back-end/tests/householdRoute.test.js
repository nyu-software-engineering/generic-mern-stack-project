const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../app")

chai.use(chaiHttp)
chai.should()

describe("POST /api/households", () => {
  it("should return 201 with the new household and an invite code", (done) => {
    chai
      .request(server)
      .post("/api/households")
      .send({ name: "Maple St Apartment", ownerId: 1 })
      .end((err, res) => {
        res.should.have.status(201)
        res.body.household.household_name.should.equal("Maple St Apartment")
        res.body.household.owner_id.should.equal(1)
        res.body.household.invite_code.should.match(/^[0-9A-F]{6}$/)
        res.body.inviteLink.should.equal(
          `/join-household?code=${res.body.household.invite_code}`
        )
        done()
      })
  })

  it("should return 400 when the household name is missing", (done) => {
    chai
      .request(server)
      .post("/api/households")
      .send({})
      .end((err, res) => {
        res.should.have.status(400)
        res.body.errors.name.should.equal("Household name is required")
        done()
      })
  })

  it("should return 400 when the household name is too long", (done) => {
    chai
      .request(server)
      .post("/api/households")
      .send({ name: "a".repeat(51) })
      .end((err, res) => {
        res.should.have.status(400)
        res.body.errors.should.have.property("name")
        done()
      })
  })

  it("should give two new households different ids", (done) => {
    const agent = chai.request(server).keepOpen()

    Promise.all([
      agent.post("/api/households").send({ name: "House One" }),
      agent.post("/api/households").send({ name: "House Two" }),
    ])
      .then(([first, second]) => {
        first.body.household.household_id.should.not.equal(second.body.household.household_id)
        agent.close()
        done()
      })
      .catch((error) => {
        agent.close()
        done(error)
      })
  })
})
