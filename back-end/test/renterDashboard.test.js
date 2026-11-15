import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import express from "express";
import { createApp } from "../app.js";
import { createRenterDashboardRouter } from "../routes/renterDashboard.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

describe("Renter dashboard and saved items (#119)", () => {
  let data;
  let server;

  beforeEach(async () => {
    data = mockData();
    const [lamp] = data.listings;
    data.listings.push(
      { ...lamp, id: 2, ownerId: "student-2", title: "Projector" },
      { ...lamp, id: 3, ownerId: "student-2", status: "draft" },
      { ...lamp, id: 4, ownerId: "student-2", status: "paused" },
    );
    data.rentals.push({
      ...data.rentals[0],
      id: 102,
      listingId: 2,
      ownerId: "student-2",
      borrowerId: "owner-1",
      status: "extension_requested",
    });
    server = await startTestServer(createApp({ store: { load: async () => data } }));
  });

  afterEach(async () => { await server?.close(); });

  function request(path, method = "GET", body, baseUrl = server.baseUrl) {
    return fetch(`${baseUrl}/api${path}`, {
      method,
      headers: { "content-type": "application/json", "x-user-id": "student-2" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  it("returns only the current borrower's rentals, with their listing titles", async () => {
    const response = await request("/rentals/mine");
    expect(response.status).to.equal(200);
    expect(await response.json()).to.deep.equal([{ ...data.rentals[1], listingTitle: "Projector" }]);
  });

  it("reflects changes to rentals and handles a missing listing", async () => {
    data.rentals[1].status = "completed";
    data.listings = data.listings.filter(({ id }) => id !== 2);
    expect(await (await request("/rentals/mine")).json()).to.deep.equal([
      { ...data.rentals[1], listingTitle: "Listing unavailable" },
    ]);

    data.rentals.pop();
    expect(await (await request("/rentals/mine")).json()).to.deep.equal([]);
  });

  it("saves and unsaves a listing without creating duplicates", async () => {
    const listing = data.listings[1];
    const body = { listingId: listing.id, userId: "student-2" };
    expect(await (await request("/saved-items")).json()).to.deep.equal([]);

    const created = await request("/saved-items", "POST", body);
    expect(created.status).to.equal(201);
    expect(await created.json()).to.deep.equal(listing);
    expect((await request("/saved-items", "POST", body)).status).to.equal(200);
    expect(await (await request("/saved-items")).json()).to.deep.equal([listing]);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const removed = await request("/saved-items", "DELETE", body);
      expect(removed.status).to.equal(204);
      expect(await removed.text()).to.equal("");
    }
    expect(await (await request("/saved-items")).json()).to.deep.equal([]);
  });

  it("rejects invalid listing IDs for both writes", async () => {
    for (const method of ["POST", "DELETE"]) {
      for (const body of [undefined, {}, { listingId: 0 }, { listingId: "2" }, { listingId: 1.5 }]) {
        const response = await request("/saved-items", method, body);
        expect(response.status).to.equal(400);
        expect(await response.json()).to.deep.equal({ error: "A positive integer listingId is required." });
      }
    }
  });

  it("rejects saving your own, unpublished, or missing listings", async () => {
    expect((await request("/saved-items", "POST", { listingId: 1 })).status).to.equal(403);
    for (const listingId of [3, 4, 999]) {
      expect((await request("/saved-items", "POST", { listingId })).status).to.equal(404);
    }
    expect(await (await request("/saved-items")).json()).to.deep.equal([]);
  });

  it("hides a saved listing when it is paused and can still remove the save", async () => {
    const body = { listingId: 2 };
    expect((await request("/saved-items", "POST", body)).status).to.equal(201);

    data.listings[1].status = "paused";
    expect(await (await request("/saved-items")).json()).to.deep.equal([]);
    expect((await request("/saved-items", "DELETE", body)).status).to.equal(204);

    data.listings[1].status = "published";
    expect(await (await request("/saved-items")).json()).to.deep.equal([]);
  });

  it("keeps saves scoped to the server's current user", async () => {
    let currentUserId = "owner-1";
    const app = express();
    app.locals.mockDataStore = { load: async () => data };
    app.use(express.json());
    app.use((req, _res, next) => {
      req.currentUserId = currentUserId;
      next();
    });
    app.use("/api", createRenterDashboardRouter());

    const probe = await startTestServer(app);
    try {
      const body = { listingId: 2 };
      expect((await request("/saved-items", "POST", body, probe.baseUrl)).status).to.equal(201);
      currentUserId = "student-2";
      expect(await (await request("/saved-items", "GET", undefined, probe.baseUrl)).json()).to.deep.equal([]);
      expect((await request("/saved-items", "DELETE", body, probe.baseUrl)).status).to.equal(204);
      currentUserId = "owner-1";
      expect(await (await request("/saved-items", "GET", undefined, probe.baseUrl)).json()).to.deep.equal([data.listings[1]]);
    } finally {
      await probe.close();
    }
  });
});
