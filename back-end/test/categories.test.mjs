import { expect } from "chai"
import { request } from "chai-http"
import app from "../app.js"

describe("GET /api/categories", () => {
    it ("returns a list of categories", async() => {
        const response = await request.execute(app).get("/api/categories")

        expect(response.status).to.equal(200)
        expect(response.body).to.be.an("array")
        expect(response.body).to.include("Tutoring")
    })
})