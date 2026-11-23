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

// PUT tests use user 2 so they don't change user 1, which the GET tests check
describe("PUT /api/profile/:id", () => {
    it("updates the profile and keeps fields that weren't sent", async () => {
        const response = await request.execute(app)
            .put("/api/profile/2")
            .send({ full_name: "Gaston T.", email: "gaston@nyu.edu", bio: "Updated bio" })

        expect(response.status).to.equal(200)
        expect(response.body).to.include({
            id: 2,
            full_name: "Gaston T.",
            email: "gaston@nyu.edu",
            bio: "Updated bio",
        })
        // university wasn't sent, so it should be unchanged
        expect(response.body.university).to.equal("NYU")
    })

    it("returns 404 for a profile that doesn't exist", async () => {
        const response = await request.execute(app)
            .put("/api/profile/999")
            .send({ full_name: "Nobody", email: "nobody@nyu.edu" })

        expect(response.status).to.equal(404)
        expect(response.body).to.have.property("error")
    })

    it("returns 400 when no body is sent", async () => {
        const response = await request.execute(app).put("/api/profile/2")

        expect(response.status).to.equal(400)
        expect(response.body).to.have.property("error")
    })

    it("returns 400 when full_name is blank", async () => {
        const response = await request.execute(app)
            .put("/api/profile/2")
            .send({ full_name: "   ", email: "gaston@nyu.edu" })

        expect(response.status).to.equal(400)
        expect(response.body).to.have.property("error")
    })

    it("returns 400 when email is not a string", async () => {
        const response = await request.execute(app)
            .put("/api/profile/2")
            .send({ full_name: "Gaston", email: 12345 })

        expect(response.status).to.equal(400)
        expect(response.body).to.have.property("error")
    })

    it("returns 400 when email has no @", async () => {
        const response = await request.execute(app)
            .put("/api/profile/2")
            .send({ full_name: "Gaston", email: "not-an-email" })

        expect(response.status).to.equal(400)
        expect(response.body).to.have.property("error")
    })
})