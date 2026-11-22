import { expect } from "chai"
import { request } from "chai-http"
import app from "../app.js"

describe("GET /api/profile/:id", () => {
    it("returns the profile for a valid id", async () => {
        const response = await request.execute(app).get("/api/profile/1")

        expect(response.status).to.equal(200)
        expect(response.body.full_name).to.equal()
    })
})