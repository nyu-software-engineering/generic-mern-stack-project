import { expect } from "chai"
import request from "supertest"
import app from "../app.js"
import profile from "../data/profile.js"

describe("Profile hobby routes", () => {
    const originalHobbies = [...profile.hobbies]
    afterEach(() => {
        profile.hobbies = [...originalHobbies]
    })

    it("adds a hobby", async () => {
        const response = await request(app)
            .post("/api/profile/hobbies")
            .send({ hobby: "Photography" })
        expect(response.status).to.equal(201)
        expect(response.body.hobbies).to.include("Photography")
    })

    it("rejects an empty hobby", async() => {
        const response = await request(app)
            .post("/api/profile/hobbies")
            .send({ hobby: "" })
        expect(response.status).to.equal(400)
    })

    it("rejects duplicate hobbies", async () => {
        await request(app)
            .post("/api/profile/hobbies")
            .send({ hobby: "Photography" })
        const response = await request(app)
            .post("/api/profile/hobbies")
            .send({ hobby: "Photography" })
        expect(response.status).to.equal(409)
    })

    it("removes an existing hobby", async() => {
        await request(app)
            .post("/api/profile/hobbies")
            .send({ hobby: "Photography" })
        const response = await request(app)
            .delete("/api/profile/hobbies/Photography")
        expect(response.status).to.equal(200)
        expect(response.body.hobbies).to.not.include("Photography")
    })

    it("returns 404 for an unknown hobby", async() => {
        const response = await request(app)
            .delete("/api/profile/hobbies/UnknownHobby")
        expect(response.status).to.equal(404)
    })
})