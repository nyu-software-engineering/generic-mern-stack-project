import { expect } from "chai"
import request from "supertest"
import app from "../app.js"

describe("GET /api/health", () => {
  it("responds with status ok", async () => {
    const res = await request(app).get("/api/health")
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({ status: "ok" })
  })
})