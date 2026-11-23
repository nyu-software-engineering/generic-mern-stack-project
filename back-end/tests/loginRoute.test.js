const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../app")
const authService = require("../services/authService")

chai.use(chaiHttp)
chai.should()

describe("POST /api/login", () => {
  // the route uses authService.loginUser, so tests swap it for a fake to avoid calling Mockaroo
  const originalLoginUser = authService.loginUser

  afterEach(() => {
    authService.loginUser = originalLoginUser
  })

  it("should return 400 when the email is missing", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ password: "password123" })
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.have.property("error", "Email and password are required")

        done()
      })
  })

  it("should return 400 when the password is missing", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ email: "demo@splitlease.com" })
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.have.property("error", "Email and password are required")

        done()
      })
  })

  it("should return the user and a token when the login is correct", (done) => {
    authService.loginUser = async () => ({
      id: 1,
      firstName: "Demo",
      lastName: "User",
      email: "demo@splitlease.com",
      householdId: 1,
    })

    chai
      .request(server)
      .post("/api/login")
      .send({ email: "demo@splitlease.com", password: "password123" })
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.have.property("token", "mock-token-1")
        res.body.user.should.have.property("email", "demo@splitlease.com")
        res.body.user.should.not.have.property("password")

        done()
      })
  })

  it("should return 401 when the email or password is wrong", (done) => {
    authService.loginUser = async () => null

    chai
      .request(server)
      .post("/api/login")
      .send({ email: "demo@splitlease.com", password: "wrong-password" })
      .end((err, res) => {
        res.should.have.status(401)
        res.body.should.have.property("error", "Incorrect email or password")

        done()
      })
  })

  it("should return 502 when the mock API cannot be reached", (done) => {
    authService.loginUser = async () => {
      throw new Error("Mockaroo is down")
    }

    chai
      .request(server)
      .post("/api/login")
      .send({ email: "demo@splitlease.com", password: "password123" })
      .end((err, res) => {
        res.should.have.status(502)

        done()
      })
  })
})
