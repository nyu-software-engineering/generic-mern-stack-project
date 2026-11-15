import { describe, it } from "mocha";
import { expect } from "chai";
import { createMockDataStore } from "../services/mockData.js";
import { mockData } from "./fixtures.js";

describe("Shared mock data store", () => {
  it("fetches once for concurrent calls and keeps shared changes", async () => {
    let calls = 0;
    const store = createMockDataStore({
      apiKey: "test-key",
      fetchImpl: async (url, options) => {
        calls += 1;
        expect(url).to.equal("https://my.api.mockaroo.com/dormshare.json");
        expect(options.headers["X-API-Key"]).to.equal("test-key");
        expect(options.signal).to.be.instanceOf(AbortSignal);
        return Response.json(mockData());
      },
    });

    const [first, second] = await Promise.all([store.load(), store.load()]);
    expect(first).to.equal(second);
    expect(first).to.deep.equal(mockData());
    first.rentals[0].status = "active";
    expect((await store.load()).rentals[0].status).to.equal("active");
    expect(calls).to.equal(1);
  });

  it("reads the environment key when loading and retries after configuration changes", async () => {
    const originalKey = process.env.MOCKAROO_API_KEY;
    let calls = 0;
    const store = createMockDataStore({
      fetchImpl: async (_url, options) => {
        calls += 1;
        expect(options.headers["X-API-Key"]).to.equal("configured-key");
        return Response.json(mockData());
      },
    });
    try {
      delete process.env.MOCKAROO_API_KEY;
      const error = await store.load().catch((failure) => failure);
      expect(error.status).to.equal(503);
      expect(calls).to.equal(0);
      process.env.MOCKAROO_API_KEY = "configured-key";
      expect(await store.load()).to.deep.equal(mockData());
      expect(calls).to.equal(1);
    } finally {
      if (originalKey === undefined) delete process.env.MOCKAROO_API_KEY;
      else process.env.MOCKAROO_API_KEY = originalKey;
    }
  });

  it("rejects a blank explicit key without calling Mockaroo", async () => {
    const store = createMockDataStore({
      apiKey: "   ",
      fetchImpl: () => { throw new Error("Fetch should not run."); },
    });
    const error = await store.load().catch((failure) => failure);
    expect(error.status).to.equal(503);
  });

  for (const [name, fail] of [
    ["HTTP failure", () => new Response("private upstream body", { status: 429 })],
    ["invalid JSON", () => new Response("not JSON")],
    ["invalid schema", () => Response.json({ ...mockData(), users: null })],
    ["network error", () => { throw new Error("private-key and private upstream details"); }],
    ["timeout", () => { throw new DOMException("private timeout details", "TimeoutError"); }],
  ]) {
    it(`returns a safe error and allows retry after ${name}`, async () => {
      let calls = 0;
      const store = createMockDataStore({
        apiKey: "private-key",
        fetchImpl: async () => (++calls === 1 ? fail() : Response.json(mockData())),
      });
      const error = await store.load().catch((failure) => failure);
      expect(error).to.be.instanceOf(Error);
      expect(error.status).to.equal(502);
      expect(error.message).to.equal("Could not load mock data.");
      expect(await store.load()).to.deep.equal(mockData());
      expect(calls).to.equal(2);
    });
  }

  it("normalizes the optional Quick Borrow collection", async () => {
    const payload = mockData();
    delete payload.quickBorrowRequests;
    const store = createMockDataStore({ apiKey: "test-key", fetchImpl: async () => Response.json(payload) });
    expect((await store.load()).quickBorrowRequests).to.deep.equal([]);
  });

  it("preserves rental handoff fields", async () => {
    const payload = mockData();
    payload.rentals[0].pickupCheck = { condition: "As described", confirmedBy: "student-2" };
    const store = createMockDataStore({ apiKey: "test-key", fetchImpl: async () => Response.json(payload) });
    expect((await store.load()).rentals[0].pickupCheck).to.deep.equal(payload.rentals[0].pickupCheck);
  });

  for (const [name, corrupt] of [
    ["duplicate listing IDs", (data) => data.listings.push({ ...data.listings[0] })],
    ["unknown borrowers", (data) => { data.rentals[0].borrowerId = "missing"; }],
    ["invalid rental status", (data) => { data.rentals[0].status = "unknown"; }],
    ["reviews of incomplete rentals", (data) => { data.rentals[0].status = "active"; }],
    ["invalid review ratings", (data) => { data.reviews[0].overallRating = 6; }],
    ["another sender's response message", (data) => { data.itemRequests[0].responses[0].responderId = "student-2"; }],
  ]) {
    it(`rejects ${name} before sharing records`, async () => {
      const payload = mockData();
      corrupt(payload);
      const store = createMockDataStore({ apiKey: "test-key", fetchImpl: async () => Response.json(payload) });
      const error = await store.load().catch((failure) => failure);
      expect(error.status).to.equal(502);
    });
  }
});
