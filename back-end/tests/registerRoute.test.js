const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../app")
const authService = require("../services/authService")

chai.use(chaiHttp)
chai.should()

describe("POST /api/register", () => {
  // the route uses authService.registerUser, so tests swap it for a fake to avoid calling Mockaroo
  const originalRegisterUser = authService.registerUser

  afterEach(() => {
    authService.registerUser = originalRegisterUser
  })

  const form = {
    name: "Sam Rivera",
    email: "sam@example.com",
    password: "password123",
    confirmPassword: "password123",
  }

  it("should return 201 with the new user and a token when the form is valid", (done) => {
    authService.registerUser = async () => ({
      user: {
        id: 8,
        firstName: "Sam",
        lastName: "Rivera",
        email: "sam@example.com",
        householdId: null,
      },
    })

    chai
      .request(server)
      .post("/api/register")
      .send(form)
      .end((err, res) => {
        res.should.have.status(201)
        res.body.should.have.property("token", "mock-token-8")
        res.body.user.should.have.property("email", "sam@example.com")
        res.body.user.should.not.have.property("password")

        done()
      })
  })

  it("should return 400 with the errors when the form has mistakes", (done) => {
    // uses the real service: these checks happen before Mockaroo is called
    chai
      .request(server)
      .post("/api/register")
      .send({ name: "", email: "not-an-email", password: "short", confirmPassword: "other" })
      .end((err, res) => {
        res.should.have.status(400)
        res.body.errors.should.have.property("name")
        res.body.errors.should.have.property("email")
        res.body.errors.should.have.property("password")
        res.body.errors.should.have.property("confirmPassword")

        done()
      })
  })

  it("should return 409 when the email is already used", (done) => {
    authService.registerUser = async () => ({
      errors: { email: "An account with this email already exists" },
      emailTaken: true,
    })

    chai
      .request(server)
      .post("/api/register")
      .send(form)
      .end((err, res) => {
        res.should.have.status(409)
        res.body.errors.should.have.property("email")

        done()
      })
  })

  it("should return 502 when the mock API cannot be reached", (done) => {
    authService.registerUser = async () => {
      throw new Error("Mockaroo is down")
    }

    chai
      .request(server)
      .post("/api/register")
      .send(form)
      .end((err, res) => {
        res.should.have.status(502)

        done()
      })
  })
})
