import { expect } from "chai"
import { request } from "chai-http"
import app from "../app.js"

const email = "test2@nyu.edu"
const password = "test-password"

describe("POST /api/auth/login", () => {
    before(async () => {
        const response = await request.execute(app)
            .post("/api/auth/register")
            .send({ email, password })

        expect(response.status).to.equal(201)
    })

    it("logs in with the correct password", async () => {
        const response = await request.execute(app)
            .post("/api/auth/login")
            .send({ email, password })

        expect(response.status).to.equal(200)
        expect(response.body.user.email).to.equal(email)
    })

    it("rejects the wrong password", async () => {
        const response = await request.execute(app)
            .post("/api/auth/login")
            .send({ email, password: "wrong-password" })

        expect(response.status).to.equal(401)
    })
})