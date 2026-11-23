import { expect } from "chai";
import request from "supertest";
import sinon from "sinon";
import axios from "axios";
import app from "../app.mjs";

describe("Jargonot API", function () {
  it("should return a successful health response", async function () {
    const res = await request(app).get("/api/health");

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("ok");
  });
  it("should return 500 when Mockaroo configuration is missing", async function () {
    const originalKey = process.env.MOCKAROO_API_KEY;
    const originalUrl = process.env.MOCKAROO_API_URL;
    delete process.env.MOCKAROO_API_KEY;
    delete process.env.MOCKAROO_API_URL;

    try {
      const res = await request(app).get("/api/articles");
      expect(res.status).to.equal(500);
      expect(res.body.error).to.equal("Mockaroo configuration is missing");
    } finally {
      if (originalKey === undefined) {
        delete process.env.MOCKAROO_API_KEY;
      } else {
        process.env.MOCKAROO_API_KEY = originalKey;
      }
      if (originalUrl === undefined) {
        delete process.env.MOCKAROO_API_URL;
      } else {
        process.env.MOCKAROO_API_URL = originalUrl;
      }
    }
  });

  it("should return articles when Mockaroo responds successfully", async function () {
    const originalKey = process.env.MOCKAROO_API_KEY;
    const originalUrl = process.env.MOCKAROO_API_URL;
    process.env.MOCKAROO_API_KEY = "test-key";
    process.env.MOCKAROO_API_URL = "https://example.com/articles.json";
    const mockArticles = [
      { id: 1, title: "Machine Learning Research", topic: "AI/ML" },
      { id: 2, title: "Cybersecurity Research", topic: "Cybersecurity" },
    ];

    const axiosStub = sinon.stub(axios, "get").resolves({
      data: mockArticles,
    });

    try {
      const res = await request(app).get("/api/articles");

      expect(res.status).to.equal(200);
      expect(res.body.articles).to.deep.equal(mockArticles);

      expect(axiosStub.calledOnce).to.equal(true);
      expect(axiosStub.firstCall.args[0]).to.equal(
        "https://example.com/articles.json"
      );
      expect(axiosStub.firstCall.args[1].params).to.deep.equal({
        key: "test-key",
      });
    } finally {
      axiosStub.restore();

      if (originalKey === undefined) {
        delete process.env.MOCKAROO_API_KEY;
      } else {
        process.env.MOCKAROO_API_KEY = originalKey;
      }

      if (originalUrl === undefined) {
        delete process.env.MOCKAROO_API_URL;
      } else {
        process.env.MOCKAROO_API_URL = originalUrl;
      }
    }
  });
  it("should return 502 when Mockaroo request fails", async function () {
    const originalKey = process.env.MOCKAROO_API_KEY;
    const originalUrl = process.env.MOCKAROO_API_URL;

    process.env.MOCKAROO_API_KEY = "test-key";
    process.env.MOCKAROO_API_URL = "https://example.com/articles.json";
    const axiosStub = sinon
      .stub(axios, "get")
      .rejects(new Error("Mockaroo unavailable"));

    try {
      const res = await request(app).get("/api/articles");

      expect(res.status).to.equal(502);
      expect(res.body.error).to.equal("Unable to retrieve articles");
      expect(axiosStub.calledOnce).to.equal(true);
    } finally {
      axiosStub.restore();

      if (originalKey === undefined) {
        delete process.env.MOCKAROO_API_KEY;
      } else {
        process.env.MOCKAROO_API_KEY = originalKey;
      }

      if (originalUrl === undefined) {
        delete process.env.MOCKAROO_API_URL;
      } else {
        process.env.MOCKAROO_API_URL = originalUrl;
      }
    }
  });
});
