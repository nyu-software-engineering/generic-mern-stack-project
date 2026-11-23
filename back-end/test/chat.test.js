import {expect} from "chai"
import request from "supertest"
import app from "../app.js"
import chats from "../data/chats.js"

describe("Chat routes", () => {
    const originalMessages = chats.map(chat =>
        chat.messages.map(message=> ({ ...message }))
    )
    afterEach(() => {
        chats.forEach((chat, index) => {
            chat.messages = originalMessages[index].map(
                message => ({ ...message })
            )
        })
    })

    it("returns a list of conversations", async () => {
        const response = await request(app).get("/api/chats")
        expect(response.status).to.equal(200)
        expect(response.body).to.be.an("array")
        expect(response.body.length).to.be.greaterThan(0)
    })

    it("returns an existing conversation", async () => {
        const response = await request(app).get("/api/chats/1")
        expect(response.status).to.equal(200)
        expect(response.body.name).to.equal("Avery Chen")
    })

    it("returns 404 for an unknown conversation", async () => {
        const response = await request(app).get("/api/chats/999")
        expect(response.status).to.equal(404)
        expect(response.body.error).to.equal("Chat not found")
    })

    it("returns messages for a conversation", async () => {
        const response = await request(app).get("/api/chats/1/messages")
        expect(response.status).to.equal(200)
        expect(response.body).to.be.an("array")
        expect(response.body[0].sentByMe).to.equal(false)
    })

    it("adds a new message", async () => {
        const response = await request(app)
            .post("/api/chats/1/messages")
            .send({ text: "See you there!" })
        expect(response.status).to.equal(201)
        expect(response.body.text).to.equal("See you there!")
        expect(response.body.sentByMe).to.equal(true)
        const messages = await request(app).get("/api/chats/1/messages")
        expect(messages.body.length).to.equal(2)
    })

    it("rejects an empty message", async () => {
        const response = await request(app)
            .post("/api/chats/1/messages")
            .send({ text: "  "})
        expect(response.status).to.equal(400)
        expect(response.body.error).to.equal("Message text is required")
    })

    it("rejects messages to unknown conversations", async () => {
        const response = await request(app)
            .post("/api/chats/999/messages")
            .send({ text: "Hello" })
        expect(response.status).to.equal(404)
    })
})