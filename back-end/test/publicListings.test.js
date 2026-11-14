import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

describe("Public listing routes (#116)", () => {
  let data;
  let server;

  beforeEach(async () => {
    data = mockData();
    const [lamp] = data.listings;
    data.listings.push(
      { ...lamp, id: 2, ownerId: "student-2", title: "Box Fan", description: "Adjustable speed.", category: "Appliances" },
      { ...lamp, id: 3, title: "Paper Tray", status: "draft" },
      { ...lamp, id: 4, title: "Floor Lamp", status: "paused" },
    );
    server = await startTestServer(createApp({ store: { load: async () => data } }));
  });

  afterEach(async () => { await server?.close(); });

  async function get(path = "") {
    const response = await fetch(`${server.baseUrl}/api/listings${path}`);
    return { status: response.status, body: await response.json() };
  }

  it("returns only published listings from all owners", async () => {
    expect(await get()).to.deep.equal({ status: 200, body: data.listings.slice(0, 2) });
    expect((await get("?search=&category=")).body.map((listing) => listing.id)).to.deep.equal([1, 2]);
  });

  it("matches title or description ignoring case and surrounding whitespace", async () => {
    expect((await get("?search=%20DESK%20")).body.map((listing) => listing.id)).to.deep.equal([1]);
    expect((await get("?search=adjustable")).body.map((listing) => listing.id)).to.deep.equal([1, 2]);
  });

  it("filters by category alone or together with search", async () => {
    expect(await get("?category=Study%20supplies")).to.deep.equal({ status: 200, body: [data.listings[0]] });
    expect(await get("?search=adjustable&category=Appliances")).to.deep.equal({ status: 200, body: [data.listings[1]] });
    expect(await get("?search=lamp&category=Appliances")).to.deep.equal({ status: 200, body: [] });
  });

  for (const query of ["category=Other", "category=Appliances&category=Furniture", "search=desk&search=lamp"]) {
    it(`rejects invalid filters: ${query}`, async () => {
      expect(await get(`?${query}`)).to.deep.equal({ status: 400, body: { error: "Invalid listing filters." } });
    });
  }

  it("returns published item details for another owner's listing", async () => {
    expect(await get("/2")).to.deep.equal({ status: 200, body: data.listings[1] });
  });

  for (const id of ["3", "4", "999", "missing"]) {
    it(`returns 404 when item ${id} is unavailable`, async () => {
      expect(await get(`/${id}`)).to.deep.equal({ status: 404, body: { error: "Listing not found." } });
    });
  }

  it("keeps the owner route separate and reflects its status changes", async () => {
    expect((await get("/mine")).body.map((listing) => listing.id)).to.deep.equal([1, 3, 4]);
    const update = await fetch(`${server.baseUrl}/api/listings/3/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    expect(update.status).to.equal(200);
    expect((await get("/3")).body.status).to.equal("published");
    expect((await get()).body.map((listing) => listing.id)).to.deep.equal([1, 2, 3]);
  });
});
