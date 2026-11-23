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

    it("rejects a service with an invalid category", async () => {
        const newService = {
            title: "Baking Cookies",
            userId: 1,
            category: "Cooking",
            price: 25
        }

        const response = await request.execute(app).post("/api/services").send(newService)

        expect(response.status).to.equal(400)
    })

    it("rejects a service with an invalid userId", async () => {
        const newService = {
            title: "Python tutoring",
            userId: 10,
            category: "Tutoring",
            price:25
        }

        const response = await request.execute(app).post("/api/services").send(newService)
        expect(response.status).to.equal(400)
    })

    it("rejects a service with an invalid price", async () => {
        const newService = {
            title: "Python tutoring",
            userId: 1,
            category: "Tutoring",
            price:-1
        }

        const response = await request.execute(app).post("/api/services").send(newService)
        expect(response.status).to.equal(400)
    })
})