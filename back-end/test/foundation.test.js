import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { currentUser } from "../middleware/currentUser.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { createMockDataStore } from "../services/mockData.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

describe("Backend foundation", () => {
  let app;
  let server;
  let store;

  beforeEach(async () => {
    store = createMockDataStore({ apiKey: "test-key", fetchImpl: async () => Response.json(mockData()) });
    app = createApp({ store });
    server = await startTestServer(app);
  });

  afterEach(async () => { await server?.close(); });

  it("serves health without loading shared data", async () => {
    store.load = async () => { throw new Error("Data is unavailable."); };
    const response = await fetch(`${server.baseUrl}/api/health`);
    expect(response.status).to.equal(200);
    expect(await response.json()).to.deep.equal({ status: "ok" });
  });

  it("serves the shared payload and later route changes", async () => {
    expect(app.locals.mockDataStore).to.equal(store);
    const response = await fetch(`${server.baseUrl}/api/mock-data`);
    expect(response.status).to.equal(200);
    expect(await response.json()).to.deep.equal(mockData());

    const data = await app.locals.mockDataStore.load();
    data.rentals[0].status = "active";
    const updated = await fetch(`${server.baseUrl}/api/mock-data`);
    expect((await updated.json()).rentals[0].status).to.equal("active");
  });

  for (const [status, message] of [
    [502, "Could not load mock data."],
    [503, "Mock data is not configured."],
    [500, "An unexpected error occurred."],
  ]) {
    it(`returns safe JSON for a ${status} error`, async () => {
      store.load = async () => { throw Object.assign(new Error("private-key and internal details"), { status }); };
      const response = await fetch(`${server.baseUrl}/api/mock-data`);
      expect(response.status).to.equal(status);
      expect(await response.json()).to.deep.equal({ error: message });
    });
  }

  it("returns JSON for an unknown API route", async () => {
    const response = await fetch(`${server.baseUrl}/api/missing`);
    expect(response.status).to.equal(404);
    expect(await response.json()).to.deep.equal({ error: "API route not found." });
  });

  it("rejects malformed JSON before routing", async () => {
    const response = await fetch(`${server.baseUrl}/api/mock-data`, {
      method: "POST", headers: { "content-type": "application/json" }, body: '{"private":',
    });
    expect(response.status).to.equal(400);
    expect(await response.json()).to.deep.equal({ error: "Invalid JSON." });
  });

  it("rejects oversized JSON bodies", async () => {
    const response = await fetch(`${server.baseUrl}/api/mock-data`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ data: "x".repeat(110000) }),
    });
    expect(response.status).to.equal(413);
    expect(await response.json()).to.deep.equal({ error: "Request body too large." });
  });

  for (const [name, headers] of [
    ["charset", { "content-type": "application/json; charset=iso-8859-1" }],
    ["content encoding", { "content-type": "application/json", "content-encoding": "unsupported" }],
  ]) {
    it(`returns safe 415 JSON for an unsupported ${name}`, async () => {
      const response = await fetch(`${server.baseUrl}/api/mock-data`, {
        method: "POST", headers, body: JSON.stringify({ private: "request details" }),
      });
      expect(response.status).to.equal(415);
      expect(await response.json()).to.deep.equal({ error: "Unsupported request encoding." });
    });
  }
});

describe("Placeholder identity and error middleware", () => {
  it("uses owner-1 regardless of a client identity header", () => {
    const request = { currentUserId: "student-2", get: () => "student-2" };
    let continued = false;
    currentUser(request, {}, () => { continued = true; });
    expect(request.currentUserId).to.equal("owner-1");
    expect(continued).to.equal(true);
  });

  it("delegates errors when response headers were already sent", () => {
    const error = new Error("Connection failed.");
    let delegated;
    errorHandler(error, {}, { headersSent: true }, (value) => { delegated = value; });
    expect(delegated).to.equal(error);
  });
});
