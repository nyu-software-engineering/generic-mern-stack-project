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

  describe("POST /api/quick-borrow", () => {
    const valid = {
      itemName: "  Stapler ", neededBy: "2026-12-01", neededTime: "14:30",
      borrowDuration: "20 minutes", approximateArea: "Library", details: "Just for one form.",
    };

    it("creates an open request for the current user, trimming the text", async () => {
      const { status, body } = await api("POST", "", valid);

      expect(status).to.equal(201);
      expect(body).to.include({
        id: 3, requesterId: "owner-1", itemName: "Stapler", neededBy: "2026-12-01",
        neededTime: "14:30", borrowDuration: "20 minutes", status: "open",
      });
      expect(body.createdAt).to.be.a("string");
      expect(data.quickBorrowRequests).to.have.length(3);
    });

    it("shows the new request in the next GET, newest first", async () => {
      await api("POST", "", valid);

      const { body } = await api("GET");

      expect(body.map((request) => request.id)).to.deep.equal([3, 2, 1]);
    });

    it("leaves neededTime empty when it is not sent", async () => {
      const { neededTime, ...withoutTime } = valid;

      const { status, body } = await api("POST", "", withoutTime);

      expect(status).to.equal(201);
      expect(body.neededTime).to.equal("");
    });

    for (const field of ["itemName", "borrowDuration", "approximateArea", "details"]) {
      it(`rejects a blank ${field} with 400`, async () => {
        const { status, body } = await api("POST", "", { ...valid, [field]: "   " });

        expect(status).to.equal(400);
        expect(body.error).to.include(field);
        expect(data.quickBorrowRequests).to.have.length(2);
      });
    }

    it("rejects a missing or non-text field with 400", async () => {
      const { itemName, ...missing } = valid;

      expect((await api("POST", "", missing)).status).to.equal(400);
      expect((await api("POST", "", { ...valid, details: 5 })).status).to.equal(400);
    });

    for (const neededBy of [undefined, "soon", "2026-02-30", "2026-13-01"]) {
      it(`rejects neededBy ${JSON.stringify(neededBy)} with 400`, async () => {
        const { status } = await api("POST", "", { ...valid, neededBy });

        expect(status).to.equal(400);
        expect(data.quickBorrowRequests).to.have.length(2);
      });
    }

    it("rejects a non-text neededTime with 400", async () => {
      const { status } = await api("POST", "", { ...valid, neededTime: 1430 });

      expect(status).to.equal(400);
    });

    it("rejects a request with no body with 400", async () => {
      const { status } = await api("POST");

      expect(status).to.equal(400);
    });
  });
});
