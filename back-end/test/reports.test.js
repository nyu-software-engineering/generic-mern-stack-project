import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { createMockDataStore } from "../services/mockData.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

const details = () => ({ reason: "Damage", description: "  Cracked screen.  ", rentalId: 101 });

describe("Reporting routes (#118)", () => {
  let server;
  let data;

  beforeEach(async () => {
    const store = createMockDataStore({ apiKey: "test-key", fetchImpl: async () => Response.json(mockData()) });
    data = await store.load();
    server = await startTestServer(createApp({ store }));
  });

  afterEach(async () => { await server?.close(); });

  async function api(method, path, body) {
    const response = await fetch(`${server.baseUrl}/api${path}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  describe("POST /api/reports", () => {
    it("creates a report, trims the text and links the rental's listing", async () => {
      const response = await api("POST", "/reports", details());
      expect(response.status).to.equal(201);
      expect(response.body).to.include({
        id: "DS-101", reporterId: "owner-1", rentalId: "101", listingId: "1",
        conversationId: "", reason: "Damage", description: "Cracked screen.",
        status: "awaiting moderator review",
      });
      expect(response.body.createdAt).to.be.a("string");
      expect(data.reports).to.have.length(1);
    });

    it("gives each report its own id", async () => {
      await api("POST", "/reports", details());
      const second = await api("POST", "/reports", details());
      expect(second.body.id).to.equal("DS-102");
    });

    it("drops ids that match no record", async () => {
      const response = await api("POST", "/reports", {
        reason: "Other", description: "Odd.", rentalId: 999, conversationId: 999, listingId: 999,
      });
      expect(response.status).to.equal(201);
      expect(response.body).to.include({ rentalId: "", conversationId: "", listingId: "" });
    });

    it("links a conversation and takes the listing from it", async () => {
      const response = await api("POST", "/reports", { reason: "Unsafe listing", description: "Odd.", conversationId: 1 });
      expect(response.status).to.equal(201);
      expect(response.body).to.include({ conversationId: "1", rentalId: "", listingId: "1" });
    });

    it("links a listing reported directly", async () => {
      const response = await api("POST", "/reports", { reason: "Other", description: "Odd.", listingId: 1 });
      expect(response.status).to.equal(201);
      expect(response.body).to.include({ rentalId: "", conversationId: "", listingId: "1" });
    });

    it("rejects a request with no body", async () => {
      const response = await fetch(`${server.baseUrl}/api/reports`, { method: "POST" });
      expect(response.status).to.equal(400);
      expect(await response.json()).to.deep.equal({ error: "Invalid report details." });
    });

    it("leaves every link blank when none are given", async () => {
      const response = await api("POST", "/reports", { reason: "Other", description: "Odd." });
      expect(response.body).to.include({ rentalId: "", conversationId: "", listingId: "" });
    });

    for (const [name, change] of [
      ["missing reason", { reason: undefined }],
      ["unknown reason", { reason: "Spam" }],
      ["missing description", { description: undefined }],
      ["blank description", { description: "   " }],
      ["non-string description", { description: 5 }],
      ["non-string image name", { imageName: 5 }],
    ]) {
      it(`rejects ${name}`, async () => {
        const response = await api("POST", "/reports", { ...details(), ...change });
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({ error: "Invalid report details." });
        expect(data.reports ?? []).to.have.length(0);
      });
    }
  });

  describe("GET /api/reports/:id", () => {
    it("returns a report the current user filed", async () => {
      const created = await api("POST", "/reports", details());
      const response = await api("GET", "/reports/DS-101");
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(created.body);
    });

    it("returns 404 for an unknown id", async () => {
      const response = await api("GET", "/reports/DS-999");
      expect(response.status).to.equal(404);
      expect(response.body).to.deep.equal({ error: "Report not found." });
    });

    it("returns 404 for another user's report", async () => {
      data.reports = [{ id: "DS-500", reporterId: "student-2", reason: "Other", description: "x" }];
      const response = await api("GET", "/reports/DS-500");
      expect(response.status).to.equal(404);
    });
  });

  describe("GET /api/community-rules", () => {
    it("returns the rules as a list", async () => {
      const response = await api("GET", "/community-rules");
      expect(response.status).to.equal(200);
      expect(response.body.map((rule) => rule.id)).to.deep.equal(["suitable-items", "prohibited-items", "sharing-rules"]);
      for (const rule of response.body) expect(rule.title && rule.body).to.be.a("string");
    });
  });
});
