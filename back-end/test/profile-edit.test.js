import {expect} from "chai"
import request from "supertest"
import app from "../app.js"
import profile from "../data/profile.js"

describe("Profile editing routes", () => {
    const originalName = { ...profile.name }
    const originalLogin = { ...profile.login }
    const originalPrivacy = profile.privacy

    afterEach(() => {
        profile.name = { ...originalName }
        profile.login = { ...originalLogin }
        profile.privacy = originalPrivacy
    })

    it("updates the profile with valid data", async () => {
        const response = await request(app)
        .post("/api/profile/edit")
        .send({
            firstName: "Nina",
            lastName: "Shah",
            username: "ninashah",
        })
        expect(response.status).to.equal(200)
        expect(response.body.name.first).to.equal("Nina")
        expect(response.body.name.last).to.equal("Shah")
        expect(response.body.login.username).to.equal("ninashah")
    })
    
    it("makes the updated profile available through GET", async() => {
        await request(app)
            .post("/api/profile/edit")
            .send({
                firstName: "Nina",
                lastName: "Shah",
                username: "ninashah",
        })
    const response = await request(app).get("/api/profile")
    expect(response.status).to.equal(200)
    expect(response.body.login.username).to.equal("ninashah") 
    })
   
    it("rejects missing profile information", async() => {
        const response = await request(app)
            .post("/api/profile/edit")
            .send({
                firstName: "",
                lastName: "Shah",
                username: "ninashah",
            })
        expect(response.status).to.equal(400)
        expect(response.body.error).to.equal(
            "First name, last name, and username are required"
        )
        expect(profile.name.first).to.equal(originalName.first)
    })

    it("updates privacy with a valid value", async () => {
        const response = await request(app)
            .post("/api/profile/privacy")
            .send({ privacy: "private" })
        expect(response.status).to.equal(200)
        expect(response.body.privacy).to.equal("private")
    })

    it("rejects an invalid privacy value", async () => {
        const response = await request(app)
            .post("/api/profile/privacy")
            .send({ privacy: "hidden" })
        expect(response.status).to.equal(400)
        expect(response.body.error).to.equal(
            "Privacy must be public or private"
        )
    })
})