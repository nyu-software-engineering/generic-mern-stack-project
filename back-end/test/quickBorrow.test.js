import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

describe("Quick Borrow routes (#114)", () => {
  let data;
  let server;

  beforeEach(async () => {
    data = mockData();
    // The fixture already has request 1 (student-2, created 2026-11-04).
    data.quickBorrowRequests.push({
      id: 2, requesterId: "owner-1", itemName: "Screwdriver", neededBy: "2026-11-06",
      approximateArea: "Dorm lobby", details: "Need it for 20 minutes.",
      createdAt: "2026-11-05T09:00:00Z",
    });
    server = await startTestServer(createApp({ store: { load: async () => data } }));
  });

  afterEach(async () => { await server?.close(); });

  async function api(method, path = "", body) {
    const response = await fetch(`${server.baseUrl}/api/quick-borrow${path}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  describe("GET /api/quick-borrow", () => {
    it("lists the quick borrow requests, newest first", async () => {
      const { status, body } = await api("GET");

      expect(status).to.equal(200);
      expect(body.map((request) => request.id)).to.deep.equal([2, 1]);
      expect(body[1]).to.include({ itemName: "Charger", requesterId: "student-2" });
    });

    it("returns an empty list when there are no requests", async () => {
      data.quickBorrowRequests = [];

      const { status, body } = await api("GET");

      expect(status).to.equal(200);
      expect(body).to.deep.equal([]);
    });
  });
});
