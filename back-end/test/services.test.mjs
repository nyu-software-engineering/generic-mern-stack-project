import { expect } from "chai"
import {request} from "chai-http"
import app from "../app.js"

describe("GET /api/services", () => {
    it("returns a list of services", async () => {
    const response = await request.execute(app).get("/api/services")

    expect(response.status).to.equal(200)
    expect(response.body).to.be.an("array")
    expect(response.body.length).to.be.greaterThan(0)
    })
})