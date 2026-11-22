import { expect } from "chai"
import { request } from "chai-http"
import app from "../app.js"

const password = "test-password"

describe("POST /api/auth/register", () => {
    it("accepts a .edu email", async () => {
        const response = await request.execute(app)
            .post("/api/auth/register")
            .send({ email: "test@nyu.edu", password })

        expect(response.status).to.equal(201)
    })

    it("rejects a .com email", async () => {
        const response = await request.execute(app)
            .post("/api/auth/register")
            .send({ email: "test@example.com", password })

        expect(response.status).to.equal(400)
    })
})