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

        expect(response.body.id).to.be.a("number")

        const list = await request.execute(app).get("/api/services")
        expect(list.status).to.equal(200)

        const savedService = list.body.find(service => service.id === response.body.id)
        expect(savedService).to.exist
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

    it("creates a service from form data without a photo", async () => {
        const response = await request.execute(app).post("/api/services").field("title", "Calculus Tutoring").field("userId", "1").field("category", "Tutoring").field("price","25").field("priceUnit", "hour")

        expect(response.status).to.equal(200)
        expect(response.body.price).to.equal(25)
        expect(response.body.userId).to.equal(1)
    })
})