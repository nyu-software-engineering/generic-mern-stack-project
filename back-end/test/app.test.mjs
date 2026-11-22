import { expect } from "chai";
import request from "supertest";
import app from "../app.mjs";

describe("Jargonot API", function () {
  it("should return a successful health response", async function () {
    const res = await request(app).get("/api/health");

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("ok");
  });

  it("should return the articles API response", async function () {
    const res = await request(app).get("/api/articles");
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Article API is working");
    expect(res.body.articles).to.be.an("array");
    expect(res.body.articles).to.have.lengthOf(0);
  });
});
