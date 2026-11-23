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

describe("POST /api/services", () => {
    it("receives service data", async () => {
        const newService = {
            title: "Calculus tutoring",
            userId: 1,
            category: "Tutoring",
            price: 25
        }
        const response = await request.execute(app).post("/api/services").send(newService)

        expect(response.status).to.equal(200)
        expect(response.body.title).to.equal("Calculus tutoring")
    })

    it("rejects a service without a title", async () => {
        const newService = {
            userId: 1,
            category: "Tutoring",
            price: 25
        }
        const response = await request.execute(app).post("/api/services").send(newService)

        expect(response.status).to.equal(400)
    })
})