import {expect} from "chai"
import request from "supertest"
import app from "../app.js"

describe("Profile routes", () => {
    it("GET /api/profile returns a mock user", async () => {
        const response = await request(app).get("/api/profile")

        expect(response.status).to.equal(200)
        expect(response.body.name.first).to.equal("Vilma")
        expect(response.body.login.username).to.equal("bigfish909")
        expect(response.body.hobbies).to.be.an("array")
    })

    it("GET /api/profiles/:username finds an existing user", async () => {
        const response = await request(app).get(
            "/api/profiles/bigfish909"
        )
        expect(response.status).to.equal(200)
        expect(response.body.privacy).to.equal("public")
    })

    it("GET /api/profiles/:username returns 404 for unknown users", async() => {
        const response = await request(app).get(
            "/api/profiles/unknown-user"
        )
        expect(response.status).to.equal(404)
        expect(response.body.error).to.equal("Profile not found")
    })
})