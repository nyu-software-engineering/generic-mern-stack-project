import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import express from "express";
import { createApp } from "../app.js";
import { currentUser } from "../middleware/currentUser.js";
import { ownerListingsRouter } from "../routes/ownerListings.js";
import { createMockDataStore } from "../services/mockData.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

const details = () => ({
  title: "  Desk fan  ", category: "Appliances", description: "  Small fan.  ",
  price: 2.5, rentalTerms: "  Return clean.  ",
});

const invalidDetails = [
  ["missing title", { title: undefined }],
  ["blank title", { title: "   " }],
  ["non-string title", { title: 12 }],
  ["missing category", { category: undefined }],
  ["unknown category", { category: "Other" }],
  ["missing description", { description: undefined }],
  ["blank description", { description: " " }],
  ["non-string description", { description: {} }],
  ["missing price", { price: undefined }],
  ["negative price", { price: -1 }],
  ["string price", { price: "5" }],
  ["null price", { price: null }],
  ["missing rental terms", { rentalTerms: undefined }],
  ["blank rental terms", { rentalTerms: " " }],
  ["non-string rental terms", { rentalTerms: false }],
];

describe("Owner listing routes (#106)", () => {
  let server;
  let app;
  let data;

  beforeEach(async () => {
    const payload = mockData();
    payload.listings.push(
      { ...payload.listings[0], id: 2, ownerId: "student-2" },
      { ...payload.listings[0], id: 3, status: "paused" },
      { ...payload.listings[0], id: 4, status: "draft" },
    );
    const store = createMockDataStore({ apiKey: "test-key", fetchImpl: async () => Response.json(payload) });
    data = await store.load();
    app = createApp({ store });
    server = await startTestServer(app);
  });

  afterEach(async () => { await server?.close(); });

  async function api(method, path = "", body) {
    const response = await fetch(`${server.baseUrl}/api/listings${path}`, {
      method, headers: { "content-type": "application/json", "x-user-id": "student-2" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  describe("GET /api/listings/mine", () => {
    it("returns only the current owner's listings in every status", async () => {
      const response = await api("GET", "/mine");
      expect(response.status).to.equal(200);
      expect(response.body.map((listing) => listing.id)).to.deep.equal([1, 3, 4]);
      expect(response.body.map((listing) => listing.status)).to.deep.equal(["published", "paused", "draft"]);
    });

    it("returns an empty array when the owner has no listings", async () => {
      data.listings = data.listings.filter((listing) => listing.ownerId !== "owner-1");
      expect(await api("GET", "/mine")).to.deep.equal({ status: 200, body: [] });
    });
  });

  describe("POST /api/listings", () => {
    it("creates a trimmed draft using server-owned identity and metadata", async () => {
      const response = await api("POST", "", {
        ...details(), id: 99, ownerId: "student-2", status: "published", image: "https://example.com/image.png",
      });
      expect(response.status).to.equal(201);
      expect(response.body).to.deep.equal({
        id: 5, ownerId: "owner-1", status: "draft", image: "https://picsum.photos/seed/dormshare-5/320/240",
        title: "Desk fan", category: "Appliances", description: "Small fan.", price: 2.5, rentalTerms: "Return clean.",
      });
      expect(data.listings[0]).to.deep.equal(response.body);
      expect((await api("GET", "/mine")).body[0]).to.deep.equal(response.body);
    });

    it("starts at ID 1 when there are no listings and accepts a free listing", async () => {
      data.listings = [];
      const response = await api("POST", "", { ...details(), price: 0 });
      expect(response.status).to.equal(201);
      expect(response.body.id).to.equal(1);
      expect(response.body.price).to.equal(0);
    });

    for (const [name, changes] of invalidDetails) {
      it(`rejects ${name} without creating a listing`, async () => {
        const before = structuredClone(data.listings);
        const response = await api("POST", "", { ...details(), ...changes });
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property("error");
        expect(data.listings).to.deep.equal(before);
      });
    }

    for (const body of [undefined, null, [], "text"]) {
      it(`rejects a nonobject or missing body: ${JSON.stringify(body)}`, async () => {
        const before = structuredClone(data.listings);
        expect((await api("POST", "", body)).status).to.equal(400);
        expect(data.listings).to.deep.equal(before);
      });
    }
  });

  describe("PUT /api/listings/:id", () => {
    it("updates all editable details and preserves server-owned fields", async () => {
      data.listings[0].image = "https://picsum.photos/seed/original/320/240";
      data.listings[0].createdAt = "2026-11-01";
      const before = structuredClone(data.listings[0]);
      const response = await api("PUT", "/1", {
        ...details(), price: 0, id: 99, ownerId: "student-2", status: "paused", image: "changed", createdAt: "changed",
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({
        ...before, title: "Desk fan", category: "Appliances", description: "Small fan.", price: 0, rentalTerms: "Return clean.",
      });
      expect(data.listings[0]).to.deep.equal(response.body);
      expect((await api("GET", "/mine")).body[0]).to.deep.equal(response.body);
    });

    for (const [name, changes] of invalidDetails) {
      it(`rejects ${name} without changing a listing`, async () => {
        const before = structuredClone(data.listings);
        const response = await api("PUT", "/1", { ...details(), ...changes });
        expect(response.status).to.equal(400);
        expect(data.listings).to.deep.equal(before);
      });
    }

    for (const body of [undefined, null, [], "text"]) {
      it(`rejects a nonobject or missing edit body: ${JSON.stringify(body)}`, async () => {
        const before = structuredClone(data.listings);
        expect((await api("PUT", "/1", body)).status).to.equal(400);
        expect(data.listings).to.deep.equal(before);
      });
    }

    it("returns 404 for an unknown listing without changing records", async () => {
      const before = structuredClone(data.listings);
      expect(await api("PUT", "/999", details())).to.deep.equal({ status: 404, body: { error: "Listing not found." } });
      expect(data.listings).to.deep.equal(before);
    });

    it("rejects edits to another owner's listing despite a forged identity header", async () => {
      const before = structuredClone(data.listings);
      expect(await api("PUT", "/2", details())).to.deep.equal({
        status: 403, body: { error: "You can only manage your own listings." },
      });
      expect(data.listings).to.deep.equal(before);
    });
  });

  describe("PATCH /api/listings/:id/status", () => {
    for (const status of ["published", "paused", "draft"]) {
      it(`allows the owner to set ${status}`, async () => {
        const response = await api("PATCH", "/4/status", { status });
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal(status);
        expect(data.listings.find((listing) => listing.id === 4).status).to.equal(status);
      });
    }

    it("changes only status when other fields are submitted", async () => {
      const before = structuredClone(data.listings[3]);
      const response = await api("PATCH", "/4/status", {
        status: "published", id: 99, ownerId: "student-2", title: "Changed", image: "changed", price: 99,
      });
      expect(response).to.deep.equal({ status: 200, body: { ...before, status: "published" } });
      expect(data.listings[3]).to.deep.equal(response.body);
    });

    for (const body of [undefined, null, [], "text", {}, { status: "deleted" }, { status: 1 }, { status: null }, { status: true }]) {
      it(`rejects an invalid status request: ${JSON.stringify(body)}`, async () => {
        const before = structuredClone(data.listings);
        expect((await api("PATCH", "/1/status", body)).status).to.equal(400);
        expect(data.listings).to.deep.equal(before);
      });
    }

    it("returns 404 for an unknown listing", async () => {
      const before = structuredClone(data.listings);
      expect(await api("PATCH", "/999/status", { status: "paused" })).to.deep.equal({
        status: 404, body: { error: "Listing not found." },
      });
      expect(data.listings).to.deep.equal(before);
    });

    it("rejects changes to another owner's listing", async () => {
      const before = structuredClone(data.listings);
      expect(await api("PATCH", "/2/status", { status: "paused" })).to.deep.equal({
        status: 403, body: { error: "You can only manage your own listings." },
      });
      expect(data.listings).to.deep.equal(before);
    });
  });

  it("passes store failures to the safe error handler on listing routes", async () => {
    app.locals.mockDataStore.load = async () => { throw Object.assign(new Error("private-key"), { status: 502 }); };
    for (const [method, path, body] of [
      ["GET", "/mine"], ["POST", "", details()], ["PUT", "/1", details()], ["PATCH", "/1/status", { status: "paused" }],
    ]) {
      expect(await api(method, path, body)).to.deep.equal({ status: 502, body: { error: "Could not load mock data." } });
    }
  });

  it("can share the prefix with a separate public item-read router", async () => {
    const combined = express();
    combined.locals.mockDataStore = app.locals.mockDataStore;
    combined.use(currentUser);
    combined.use("/api/listings", ownerListingsRouter);
    combined.get("/api/listings/:id", (request, response) => response.json({ publicItem: request.params.id }));
    const probe = await startTestServer(combined);
    try {
      const mine = await fetch(`${probe.baseUrl}/api/listings/mine`);
      expect((await mine.json()).map((listing) => listing.id)).to.deep.equal([1, 3, 4]);
      const otherItem = await fetch(`${probe.baseUrl}/api/listings/2`);
      expect(otherItem.status).to.equal(200);
      expect(await otherItem.json()).to.deep.equal({ publicItem: "2" });
    } finally {
      await probe.close();
    }
  });
});
