import { expect } from "chai"
import { request } from "chai-http"
import app from "../app.js"

// groups related tests
describe("GET /api/profile/:id", () => {
    // it() is a test
    it("returns the profile for a valid id", async () => {
        const response = await request.execute(app).get("/api/profile/1")

        // compare values; throws error if not the same
        expect(response.status).to.equal(200)
        expect(response.body.full_name).to.equal("Cody Aartsen")
    })

    it("returns 404 for an id that doesn't exist", async () => {
        const response = await request.execute(app).get("/api/profile/67")

        expect(response.status).to.equal(404)
        expect(Object.hasOwn(response.body, "error")).to.equal(true)
    })

    it("returns 404 for a non-numeric id", async () => {
        const response = await request.execute(app).get("/api/profile/abc")

        expect(response.status).to.equal(404)
        expect(Object.hasOwn(response.body, "error")).to.equal(true)
    })
})