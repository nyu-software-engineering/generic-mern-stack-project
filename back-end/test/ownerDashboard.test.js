import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { createMockDataStore } from "../services/mockData.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

describe("Owner dashboard API (#110)", () => {
  let server;
  let app;
  let data;

  beforeEach(async () => {
    const payload = mockData();
    payload.users.push({ id: "student-3", name: "Hana Sheikh" });
    payload.listings.push(
      { ...payload.listings[0], id: 2, ownerId: "student-2", title: "Projector" },
      { ...payload.listings[0], id: 3, title: "Vacuum" },
    );
    const rental = payload.rentals[0];
    payload.rentals = [
      { ...rental, totalPrice: 0.1 },
      { ...rental, id: 102, totalPrice: 0.2 },
      { ...rental, id: 103, status: "active", totalPrice: 10 },
      { ...rental, id: 104, listingId: 3, borrowerId: "student-3", status: "extension_requested", totalPrice: 20,
        extensionRequest: { newEndDate: "2026-11-05", status: "pending" } },
      { ...rental, id: 105, status: "requested", totalPrice: 30 },
      { ...rental, id: 106, status: "confirmed", totalPrice: 40 },
      { ...rental, id: 107, status: "declined", totalPrice: 50 },
      { ...rental, id: 108, status: "cancelled", totalPrice: 60 },
      { ...rental, id: 201, listingId: 2, ownerId: "student-2", borrowerId: "owner-1", totalPrice: 900 },
    ];
    const store = createMockDataStore({ apiKey: "test-key", fetchImpl: async () => Response.json(payload) });
    data = await store.load();
    app = createApp({ store });
    server = await startTestServer(app);
  });

  afterEach(async () => { await server?.close(); });

  async function dashboard(query = "") {
    const response = await fetch(`${server.baseUrl}/api/owner/dashboard${query}`, {
      headers: { "x-user-id": "student-2" },
    });
    return { status: response.status, body: await response.json() };
  }

  it("summarizes only rentals owned by the current user", async () => {
    const response = await dashboard();
    expect(response.status).to.equal(200);
    expect(response.body.summary).to.deep.equal({ totalRentals: 8, activeRentals: 2, recordedIncome: 0.3 });
    expect(response.body.rentals.map((rental) => rental.id)).to.deep.equal([101, 102, 103, 104, 105, 106, 107, 108]);
    expect(response.body.rentals.every((rental) => rental.ownerId === "owner-1")).to.equal(true);
  });

  it("adds listing and borrower display names while preserving the rental fields", async () => {
    const response = await dashboard();
    expect(response.body.rentals[0]).to.deep.equal({
      ...data.rentals[0], listingTitle: "Desk lamp", borrowerName: "Item borrower",
    });
    expect(response.body.rentals[3]).to.deep.equal({
      ...data.rentals[3], listingTitle: "Vacuum", borrowerName: "Hana Sheikh",
    });
  });

  it("does not mutate the shared records while building the response", async () => {
    const before = structuredClone(data);
    await dashboard();
    expect(data).to.deep.equal(before);
  });

  it("returns empty rows and zero totals when the owner has no rentals", async () => {
    data.rentals = data.rentals.filter((rental) => rental.ownerId !== "owner-1");
    expect(await dashboard()).to.deep.equal({
      status: 200, body: { summary: { totalRentals: 0, activeRentals: 0, recordedIncome: 0 }, rentals: [] },
    });
  });

  it("returns zero income when none of the owner's rentals are completed", async () => {
    data.rentals = data.rentals.filter((rental) => rental.ownerId !== "owner-1" || rental.status !== "completed");
    expect((await dashboard()).body.summary).to.deep.equal({ totalRentals: 6, activeRentals: 2, recordedIncome: 0 });
  });

  for (const [price, expected] of [[1.005, 1.01], [10.075, 10.08]]) {
    it(`rounds a completed total of ${price} to ${expected}`, async () => {
      data.rentals = [{ ...data.rentals[0], totalPrice: price }];
      expect((await dashboard()).body.summary.recordedIncome).to.equal(expected);
    });
  }

  it("rounds the combined income rather than each rental separately", async () => {
    data.rentals = data.rentals.slice(0, 2).map((rental) => ({ ...rental, totalPrice: 0.004 }));
    expect((await dashboard()).body.summary.recordedIncome).to.equal(0.01);
  });

  it("preserves cent rounding across many completed rentals", async () => {
    data.rentals = Array.from({ length: 100 }, (_, index) => ({
      ...data.rentals[0], id: 1000 + index, totalPrice: 0.10075,
    }));
    expect((await dashboard()).body.summary.recordedIncome).to.equal(10.08);
  });

  it("reflects later rental and display-name changes in the shared store", async () => {
    await dashboard();
    data.rentals[0].status = "active";
    data.listings[0].title = "Updated lamp";
    data.users[1].name = "Updated borrower";
    const response = await dashboard();
    expect(response.body.summary).to.deep.equal({ totalRentals: 8, activeRentals: 3, recordedIncome: 0.2 });
    expect(response.body.rentals[0]).to.include({ status: "active", listingTitle: "Updated lamp", borrowerName: "Updated borrower" });
  });

  it("uses display fallbacks for records removed after the initial load", async () => {
    data.listings = data.listings.filter((listing) => listing.id !== 1);
    data.users = data.users.filter((user) => user.id !== "student-2");
    expect((await dashboard()).body.rentals[0]).to.include({ listingTitle: "Listing unavailable", borrowerName: "student-2" });
  });

  it("returns safe errors when loading the shared store fails", async () => {
    app.locals.mockDataStore.load = async () => { throw Object.assign(new Error("private-key"), { status: 502 }); };
    expect(await dashboard()).to.deep.equal({ status: 502, body: { error: "Could not load mock data." } });
  });

  for (const [search, ids] of [
    ["  vAcUuM  ", [104]],
    ["hAnA", [104]],
    ["student-3", [104]],
    ["", [101, 102, 103, 104, 105, 106, 107, 108]],
    ["   ", [101, 102, 103, 104, 105, 106, 107, 108]],
    ["Projector", []],
    ["no matching rental", []],
  ]) {
    it(`searches owner rentals for ${JSON.stringify(search)} without changing totals`, async () => {
      const response = await dashboard(`?search=${encodeURIComponent(search)}`);
      expect(response.status).to.equal(200);
      expect(response.body.rentals.map((rental) => rental.id)).to.deep.equal(ids);
      expect(response.body.summary).to.deep.equal({ totalRentals: 8, activeRentals: 2, recordedIncome: 0.3 });
    });
  }

  for (const [status, ids] of [
    ["all", [101, 102, 103, 104, 105, 106, 107, 108]],
    ["completed", [101, 102]],
    ["active", [103]],
    ["extension_requested", [104]],
    ["requested", [105]],
    ["confirmed", [106]],
    ["declined", [107]],
    ["cancelled", [108]],
  ]) {
    it(`filters ${status} rentals without changing totals`, async () => {
      const response = await dashboard(`?status=${status}`);
      expect(response.status).to.equal(200);
      expect(response.body.rentals.map((rental) => rental.id)).to.deep.equal(ids);
      expect(response.body.summary).to.deep.equal({ totalRentals: 8, activeRentals: 2, recordedIncome: 0.3 });
    });
  }

  it("combines search and status filters without modifying shared data", async () => {
    const before = structuredClone(data);
    expect((await dashboard("?search=lamp&status=completed")).body.rentals.map((rental) => rental.id))
      .to.deep.equal([101, 102]);
    expect((await dashboard("?search=vacuum&status=completed")).body.rentals).to.deep.equal([]);
    expect(data).to.deep.equal(before);
  });

  it("searches actual names and IDs rather than missing-record display labels", async () => {
    data.listings = [];
    data.users = [];
    expect((await dashboard("?search=Listing%20unavailable")).body.rentals).to.deep.equal([]);
    const response = await dashboard("?search=student-3");
    expect(response.body.rentals.map((rental) => rental.id)).to.deep.equal([104]);
    expect(response.body.rentals[0]).to.include({ listingTitle: "Listing unavailable", borrowerName: "student-3" });
  });

  for (const query of [
    "status=", "status=overdue", "status=ACTIVE", "status=all&status=active",
    "search=lamp&search=vacuum", "status[]=active", "status[name]=active",
    "search[]=lamp", "search[name]=lamp", "ownerId=student-2", "sort=price",
  ]) {
    it(`rejects invalid filters before loading data: ${query}`, async () => {
      let loads = 0;
      app.locals.mockDataStore.load = async () => { loads += 1; throw new Error("Must not load"); };
      expect(await dashboard(`?${query}`)).to.deep.equal({
        status: 400, body: { error: "Invalid dashboard filters." },
      });
      expect(loads).to.equal(0);
    });
  }
});
