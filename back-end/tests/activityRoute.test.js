const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../app")

chai.use(chaiHttp)
chai.should()

describe("GET /api/households/:householdId/activity", () => {
  it("should return 400 when the household ID is not a number", (done) => {
    chai
      .request(server)
      .get("/api/households/not-a-number/activity")
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.an("object")
        res.body.should.have.property(
          "error",
          "householdId must be a number",
        )

        done()
      })
  })
})